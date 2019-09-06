'use strict';

//=====================Global Variables and appplication dependensies=================================//

require('dotenv').config();

// Load Application Dependencies
const express = require('express')
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');

// Application Setup
const app = express()
app.use(cors());
const PORT = process.env.PORT || 3000;

// Connect To Database
const client = new pg.Client(process.env.DATABASE_URL)
client.connect();
client.on('error', err => console.error(err));

//ejs dependency
app.set('view engine', 'ejs');
app.use(express.static('./public/../'));

//this what returns data from our form as json object.
app.use(express.urlencoded({extended:true}));
app.listen(PORT, () => console.log(`listening on port ${PORT}`));

let property;
//=====================================ROUTES============================================//
// API Routes
app.get('/', function (req, res) {
  res.render('index')
});
app.get('/aboutUs', function (req, res) {
  res.render('aboutUs');
});
app.get('/searchResults', getLocation);

app.get('/savedBuildings/:id', getBuildingDetails);

app.post('/savedBuildings', postBuilding);

app.get('/savedBuildings', function(req, res){
  res.render('savedBuildings');
});
//=======================================Constructor Functions===========================//
// // constructor function to buld a city object instances, paths based on the geo.json file
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.mapURL = res.body.results
  this.id;
  
}


//function to add location data in database
Location.prototype.addLocation = function (){

  let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id';
  const values = [this.search_query, this.formatted_query, this.latitude, this.longitude];

  return client.query(SQL, values)
    .then (result => {
      this.id = result.rows[0].id;
    });
};
// Function constructor for kc api
function Property(property) {
  this.PIN = (property.PIN) ? property.PIN : 'No data';
  this.taxpayerName = (property.TAXPAYERNAME) ? property.TAXPAYERNAME : 'No data';
  this.jurisdiction = (property.JURISDICTION) ? property.JURISDICTION : 'No data';
  this.propName = (property.PROPNAME) ? property.PROPNAME : 'No data';
  this.presentUse = (property.PRESENTUSE) ? property.PRESENTUSE : 'No data';
  this.levyCode = (property.LEVYCODE) ? property.LEVYCODE : 'No data';
  this.address = (property.ADDRESS) ? property.ADDRESS : 'No data';
  this.appValue = (property.APPVALUE) ? '$' + property.APPVALUE : 'No data';
  this.numBuilding = (property.NUMBUILDING) ? property.NUMBUILDING : 'No data';
  this.numUnits = (property.NUMUNITS) ? property.NUMUNITS : 'No data';
  this.lotSqft = (property.LOTSQFT) ? property.LOTSQFT + 'sq ft': 'No data';
}


//=======================================================================================//



//=======================================Functions========================================//
// ERROR HANDLER
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

function searchToLatLong(request, response) {
  //Define the URL for the GEOCODE API
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.search}&key=${process.env.GEOCODE_API_KEY}`;

  superagent.get(url)
    .then(result => {
      const location = new Location(request.query.search, result);
      const cleanedAddress = cleanAddress(result.body.results[0].formatted_address);
      location.addLocation(request);
      let urlGIS = encodeURIComponent(cleanedAddress)
      getKingCountyGISdata(urlGIS)
        .then(thing => {
          response.render('searchResults', {locationData: `https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap\&markers=size:mid%7Ccolor:red%7C${location.latitude}%2c%20${location.longitude}&key=${process.env.GEOCODE_API_KEY}`,
            address:location.formatted_query,
            location: location, propertyData: thing
          });
        })
        .catch(err => {handleError(err, response)})
    })
}

function cleanAddress(address) {
  let cleaned = [];
  for (let x of address.split(' ')) {
    if (!x.includes('#') && (!x.includes('USA'))) {
      cleaned.push(x.replace(/,/,''));
    }
  }
  return cleaned.join(' ');
}

function getKingCountyGISdata(location) {
  let getPIN = `https://gismaps.kingcounty.gov/parcelviewer2/addSearchHandler.ashx?add=${location}`;
 
  return superagent.get(getPIN)
    .then((res) => {
    
      let output = JSON.parse(res.text);
     
      let PIN = output.items[0].PIN;
      return PIN;
    })
    .then(result => {
     
      let getGISurl = `https://gismaps.kingcounty.gov/parcelviewer2/pvinfoquery.ashx?pin=${result}`;
      
      return superagent.get(getGISurl)
    })

    .then(response => {
      let output = JSON.parse(response.text);
      // console.log(output);

      property = new Property (output.items[0]);
      return property;
    })
    .catch(err => {
      property = new Property ("no data");
      console.log(err);
      return property;
      
    })
}


//=======================================Ana's functions=================================//

//route to handle user request and send the response from our database or GOOGLE
function getLocation(req,res){

  //check if this lcoation exist in database
  lookupLocation(req.query.search)
    .then(location => {
      //if exists send the object as response

      if (location){
        const cleanedAddress = cleanAddress(location.formatted_query);
        // location.addLocation(request);
        let urlGIS = encodeURIComponent(cleanedAddress)
        getKingCountyGISdata(urlGIS)
          .then(thing => {
            res.render('searchResults', {locationData:  `https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap\&markers=size:mid%7Ccolor:red%7C${location.latitude}%2c%20${location.longitude}&key=${process.env.GEOCODE_API_KEY}`, address:location.formatted_query, propertyData: thing, location: location})})
      }
          

      //if doesn't exists go to go to google api
      else
      {
        searchToLatLong(req, res);
      }
    });
}

//check if data from SQL DB contains requested location
let lookupLocation = (location) =>{
  let SQL = 'SELECT * FROM locations WHERE search_query=$1';
  let values = [location];
  return client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0){
        // if so return location data
        return result.rows[0];
      }
    });
};


// add  property data fron King County API to database from search form



function postBuilding(request, response){

  const SQL = `INSERT INTO buildings (pin, taxpayer_name, prop_name, jurisdiction, present_use, app_value, lot_sqft, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
  console.log(request.body.addBuilding);

  const values = [request.body.addBuilding[0], request.body.addBuilding[1], request.body.addBuilding[2], request.body.addBuilding[3], request.body.addBuilding[4], request.body.addBuilding[5], request.body.addBuilding[6], request.body.addBuilding[7]];

  return client.query(SQL, values)
    .then(res=>{
      if(res.rowCount >0){
        response.redirect(`savedBuildings/${res.rows[0].id}`);
      }

    })
    .catch(err => {handleError(err, response)});
}

//get details about single building
function getBuildingDetails(request, response){
  let id = request.params.id;
  console.log(request.params.id);
  let SQL = 'SELECT * FROM buildings WHERE id=$1;';

  client.query(SQL, [id])
    .then(res=> {
      if(res.rowCount > 0) {
        console.log(res.rows);
        response.render('showBuilding', {propertyData: res.rows[0]});
      }

      else {
        handleError(res, response);
      }
    })

    .catch(err => {handleError(err, response)});
}
//=======================================================================================//
