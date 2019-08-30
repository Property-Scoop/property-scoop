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
  res.render('index');
})
app.get('/location', searchToLatLong);
app.get('/aboutUs', function (req, res) {
  res.render('aboutUs');
})
//=======================================Constructor Functions===========================//


//=======================================================================================//

// // constructor function to buld a city object instances, paths based on the geo.json file
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

// ///prototype function to City constructor function to post NEW data in database

// City.prototype.postLocation = function (){

//   let SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id';
//   const values = [this.search_query, this.formatted_query, this.latitude, this.longitude];

//   return client.query(SQL, values)
//     .then (result => {
//       this.id = result.rows[0].id;
//     });
// };

//=======================================Functions========================================//
// ERROR HANDLER
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

function searchToLatLong(request, response) {
  //Define the URL for the GEOCODE API
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
  // console.log(url);

  superagent.get(url)
    .then(result => {
      const location = new Location(request.query.data, result);
      response.send(location);
    })
    .catch(err => handleError(err, response));
}

//=======================================================================================//
