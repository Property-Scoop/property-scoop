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

//=====================================ROUTES============================================//
// API Routes
app.get('/', function (req, res) {
  res.render('index')
});
app.get('/aboutUs', function (req, res) {
  res.render('aboutUs');
})
app.get('/searchResults', getLocation);

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
      //console.log(this.id);
    });
};
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
      //console.log(result);
      const location = new Location(request.query.search, result);

      //envoke function to cache google location data to database 'locations'
      location.addLocation(request);
      
      response.render('searchResults', {locationData: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude}%2c%20${location.longitude}&zoom=17&size=600x300&maptype=roadmap\
        &markers=size:mid%7Ccolor:red%7C${location.latitude}%2c%20${location.longitude}&key=${process.env.GEOCODE_API_KEY}`,
      address:location.formatted_query, location: location
      });
    
    })
    .catch(err => {handleError(err, response)})
}


//=======================================================================================//


//=======================================Ana's functions=================================//

//route to handle user request and send the response from our database or GOOGLE
function getLocation(req,res){

  //check if this lcoation exist in database
  lookupLocation(req.query.search)
    .then(location => {

      if (location){
        //if exists send the object as response
        res.render('searchResults', {locationData: `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude}%2c%20${location.longitude}&zoom=17&size=600x300&maptype=roadmap\
        &markers=size:mid%7Ccolor:red%7C${location.latitude}%2c%20${location.longitude}
      &key=${process.env.GEOCODE_API_KEY}`, address:location.formatted_query, location: location});
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


// add  building to database from search form
// fix the order and value names . and in form we will have only note al other things will be as a paragraphs


// function postBuilding(request, response){

//   const SQL = `INSERT INTO buildings(image_url, owner, permit_num, year, description, value, note, sq_feet) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
//   const values = [request.body.addBuilding[1], request.body.addBuilding[0], request.body.addBuilding[3], request.body.addBuilding[5]=== './public/styles/book-icon-139.png' ? `../../../${request.body.addBooks[5]}` : request.body.addBooks[5], request.body.addBooks[2], request.body.addBooks[4]];

//   return client.query(SQL, values)
//     .then(res=>{
//       if(res.rowCount >0){
//         response.redirect(`/building/${res.rows[0].id}`);
//       }

//     })
//     .catch(error => {
//       errorHandle(error, response);
//     });
// }


//=======================================================================================//
