'use strict';
var express = require('express')
var app = express()

require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.send('hello world')
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
