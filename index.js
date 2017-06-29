// Requirements
var Express = require('express');
var app = Express();
var Q = require('q');

// Configuration
var mockedMode = false;
var serverPort = 3000;

// Constantes
var constantes = {
  ERRORS : {
    NOT_FOUND : "NOT_FOUND"
  }
}

// Node script params
process.argv.forEach(function (val, index) {
	if (index === 2 && "true" === val) {
		mockedMode = val;
	}
});

// Injections
var HulkChallengeService = require("./services/HulkChallenge.service")
var hulkChallengeServiceInstance = new HulkChallengeService(Q, mockedMode, constantes);

// Web application ressources
app.use(Express.static("WebApp", {
  extensions:["js", "html"]
}));


// Rest ressources
app.get('/v1/hulk-challenge/results', function (req, res) {
  // Get all of the results of the Hulk Challenge
  hulkChallengeServiceInstance.getAllResults().then(function(results) {
    res.status(200).json(results);
  }).fail(function(error) {
    if (constantes.ERRORS.NOT_FOUND === error) {
      res.status(404).send("No results found");
    } else {
      res.status(500).send(error);
    }
  });
});


// Starting server
app.listen(serverPort);

var startMessage = "Server started on port " + serverPort;
startMessage += mockedMode ? " in mocked mode" : "";
console.log(startMessage);