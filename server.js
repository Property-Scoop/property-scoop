'use strict';

//=====================Global Variables and appplication dependensies=================================//

const express = require('express')
const app = express()

const superagent = require('superagent');

const cors = require('cors');
app.use(cors());

require('dotenv').config();
const PORT = process.env.PORT || 3000;

//dependency for database
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL)
client.connect();
client.on('error', err => console.error(err));

//ejs dependency
app.set('view engine', 'ejs');
app.use(express.static('./public/../'));

//this what returns data from our form as json object.
app.use(express.urlencoded({extended:true}));

app.listen(PORT, () => console.log(`listening on port ${PORT}`));

//=======================================================================================//



//=====================================ROUTES============================================//
app.get('/', function (req, res) {
  res.render('index');
})
app.get('/searchResults', function (req, res) {
  res.render('searchResults');
})

app.get('/aboutUs', function (req, res) {
  res.render('aboutUs');
})
//=======================================================================================//




//=======================================Constructor Functions===========================//


//=======================================================================================//

// // constructor function to buld a city object instances, paths based on the geo.json file
// function City(query, data){
//   this.search_query = query;
//   this.formatted_query = data.formatted_address;
//   this.latitude = data.geometry.location.lat;
//   this.longitude = data.geometry.location.lng;
//   this.id;
// }

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


//=======================================================================================//




