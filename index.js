var Express = require('express');
var app = Express();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(3000);