/**
 * Service to access Hulk Challenge datas
 * @param Q{Object} promise library
 * @param mockedMode{boolean} indicates if the service is in mocked mode or not
 */
var HulkChallengeService = function (Q, mockedMode) {
    var MongoClient, assert, allResults;

    if (mockedMode) {
        allResults = require("./mock/results");
    } else {
        MongoClient = require('mongodb').MongoClient;
        assert = require('assert');
        // TODO Mongo connection
    }

    /**
     * Return all of the results of the Hulk Challenge
     * @return {Promise}
     */
    this.getAllResults = function() {
        var deferred = Q.defer();
        if (mockedMode) {
            deferred.resolve(allResults);
        } else {
            // TODO Mongo request
            deferred.reject("Not found");
        }
        return deferred.promise;
    }
    
}

module.exports = HulkChallengeService;