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

//=======================================================================================//




//=======================================Constructor Functions===========================//


//=======================================================================================//






//=======================================Functions========================================//


//=======================================================================================//
