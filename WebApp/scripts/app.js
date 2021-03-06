var formConfiguration, connectionMessage, resultsTableContainer, resultsTableContent;
var configuration = {
    URI_GET_RESULTS : "/v1/hulk-challenge/results",
    RESULTS_TOPIC : "results"
};

var gameResults = [];

/**
 * Functionnal services
 */
var hulkService = {
    /**
     * Get all results of Hulk challenge
     * @return Promise<[]>
     */
    getAllResults : function ()  {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", configuration.URI_GET_RESULTS);
            xhr.send();
            xhr.onload = () => {
                var results = JSON.parse(xhr.responseText);
                console.log("Get all results call OK !");
                resolve(results);
            }
            xhr.onerror = () => {
                reject("Get results KO : " + xhr.status + " - " + xhr.statusText + " " + xhr.responseText);
            }
        });
    },

    /**
     * Subscribe to result MQTT queue
     * @return Promise<>
     */
    subscribeResultEvent : function() {
        return new Promise((resolve, reject) => {
            // TODO -> get all results from API and start MQTT connection
            const client = mqtt.connect("ws://"+ configuration.hostname + ":" + configuration.mqttPort + "/mqtt");

            // Connect event
            client.on("connect", function(result) {
                console.log("MQTT connection OK !");
                // Start subscribe to the results topic
                client.subscribe(configuration.RESULTS_TOPIC);
                resolve("Subscribe OK");
            });

            // Error event
            client.on("error", function(error) {
                console.log("MQTT Connection Error !", error);
                reject("MQTT Connection Error : " + JSON.stringify(error));
            });

            // New message event
            client.on('message', function (topic, message) {
                // message is Buffer
                console.log(topic, message.toString());
                if (configuration.RESULTS_TOPIC === topic) {
                    gameResults.push(JSON.parse(message.toString()));
                    htmlUtils.updateResults();
                }
            });
        });
    }
}

/**
 * Utils function for HTML
 */
var htmlUtils = {
    /**
     * Update the table of results
     */
    updateResults : function() {
        // Sort by score
        gameResults.sort(function(result, nextResult) {
            return result.game.score <= nextResult.game.score;
        });
        resultsTableContent.innerHTML = "";
        // Print result
        gameResults.forEach(function(result) {
            var newLine = document.createElement("tr");
            newLine.innerHTML = "<td>" + 0 + "</td>";
            newLine.innerHTML += "<td>" + result.player.firstName + " " + result.player.lastName + "</td>";
            newLine.innerHTML += "<td>" + result.game.score + "</td>";
            resultsTableContent.append(newLine);
        });
    }
}

window.onload = function() {
    // Init selectors
    formConfiguration = document.querySelector("#formConfiguration");
    connectionMessage = document.querySelector("#connectionMessage");
    resultsTableContainer = document.querySelector("#resultsTableContainer");
    resultsTableContent = document.querySelector("#resultsTableContent");

    // Keypress event on configuration form
    formConfiguration.addEventListener("keypress", function(e) {
        if ((e.keyCode || e.which) == 13) {
            // Form submitted
            if (!formConfiguration.hostname.value || "" === formConfiguration.hostname.value.trim()) {
                // Mandatory field
                formConfiguration.hostname.focus();
            } else if (!formConfiguration.mqttPort.value || isNaN(formConfiguration.mqttPort.value.trim())) {
                // Mandatory and number type field
                formConfiguration.mqttPort.focus();
            } else {
                // Check fields OK
                configuration.hostname = formConfiguration.hostname.value.trim();
                configuration.mqttPort = formConfiguration.mqttPort.value.trim();

                formConfiguration.parentNode.setAttribute("hidden", "");
                connectionMessage.removeAttribute("hidden");

                // Get all results from REST Service
                hulkService.getAllResults().then(function(results) {
                    gameResults = results;
                    // Get all results OK -> start subscribing to MQTT result
                    return hulkService.subscribeResultEvent();
                }).then(function() {
                    // Both get results and MQTT subscribe are OK
                    htmlUtils.updateResults();
                    connectionMessage.setAttribute("hidden", "");
                    resultsTableContainer.classList.remove("hidden");
                }).catch(function(error) {
                    console.log(error);
                    alert(error);
                });
            }
        }
    });

    formConfiguration.hostname.focus();
}