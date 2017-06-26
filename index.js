var Express = require('express');
var app = Express();
var mockedMode = false;
var serverPort = 3000;
var Q = require('q');

// Node script params
process.argv.forEach(function (val, index) {
	if (index === 2 && "true" === val) {
		mockedMode = val;
	}
});

// Injections
var HulkChallengeService = require("./services/HulkChallenge.service")
var hulkChallengeService = new HulkChallengeService(Q, mockedMode);

// Web application ressources
app.get('/', function (req, res) {
  res.send('Hello World');
});


// Rest ressources
app.get('/v1/hulk-challenge/results', function (req, res) {
  // Get all of the results of the Hulk Challenge
  hulkChallengeService.getAllResults().then(function(results) {
    res.status(200).json(results);
  }).fail(function(error) {
    res.status(404).send("No results found");
  });
});


// Staring server
app.listen(serverPort);

var startMessage = "Server started on port " + serverPort;
startMessage += mockedMode ? " in mocked mode" : "";
console.log(startMessage);