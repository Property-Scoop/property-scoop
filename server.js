'use strict';
//application dependencies
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
/*app.set('view engine', 'ejs');
app.use(express.static('./public/../'));*/

app.get('/', function (req, res) {
  res.send('hello world')
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`));

//test to set up staging branch