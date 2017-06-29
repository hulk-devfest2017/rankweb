/**
 * Service to access Hulk Challenge datas
 * @param $q{Object} promise library
 * @param $mockedMode{boolean} indicates if the service is in mocked mode or not
 * @param $constantes{Json} constantes of the project
 */
var HulkChallengeService = function ($q, $mockedMode, $constantes) {
    var MongoClient, allResults;

    if ($mockedMode) {
        allResults = require("./mock/results");
    } else {
        MongoClient = require('mongodb').MongoClient;
    }

    /**
     * Error manager
     * @param deferred{Promise} The promise to reject
     * @param err{Object} Error object from MongoDB API
     * @param message{String} message of the error
     */
    var _manageError = function(deferred, err, message) {
        var newMessage = message;
        if (err) {
            newMessage += " > " + JSON.stringify(err);
        }
        console.error(newMessage);
        deferred.reject(message);
    }

    /**
     * Return all of the results of the Hulk Challenge
     * @return {Promise}
     */
    this.getAllResults = function() {
        var deferred = $q.defer();
        if ($mockedMode) {
            deferred.resolve(allResults);
        } else {
            // Default port is in /etc/mongod.conf
            var url = 'mongodb://localhost:27017/hulkdevfestgame';

            // Try connect to the Server 
            MongoClient.connect(url, function(errConnection, db) {
                if (errConnection) {
                    // Error
                    return _manageError(deferred, errConnection, "Error while triyng connect to the DB");
                }
                
                // Get all results
                db.collection('results').find({}).toArray(function(errFind, results) {
                    if (errFind) {
                        // Error
                        db.close();
                        return _manageError(deferred, errFind, "Error while getting all the results");
                    } else if (results.length === 0) {
                        // Not result found
                        db.close();
                        return _manageError(deferred, null, $constantes.ERRORS.NOT_FOUND);
                    } else {
                        // At least one result found
                        deferred.resolve(results);
                        db.close();
                    }
                });
            });
        }
        return deferred.promise;
    }
    
}

module.exports = HulkChallengeService;