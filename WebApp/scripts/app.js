var formConfiguration, connectionMessage, resultsTableContener;
var configuration = {
    URI_GET_RESULTS : "/v1/hulk-challenge/results"
};

var gameResults = [];

/**
 * Functionnal services
 */
var hulkService = {
    /**
     * Get all results of Hulk challenge
     * 
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

    subscribeResultEvent : function() {
        return new Promise((resolve, reject) => {
            // TODO -> get all results from API and start MQTT connection
            const client = mqtt.connect("ws://"+ configuration.hostname + ":" + configuration.mqttPort + "/mqtt");

            // Connect event
            client.on("connect", function(result) {
                console.log("MQTT connection OK !");
                // Start subscribe to the results topic
                client.subscribe("results");
                resolve("Subscribe OK");
            });

            // Error event
            client.on("error", function(error) {
                console.log("MQTT Connection Error !", error);
                reject("MQTT Connection Error : " + JSON.stringify(error));
            });
        });
    }
}

window.onload = function() {
    // Init selectors
    formConfiguration = document.querySelector("#formConfiguration");
    connectionMessage = document.querySelector("#connectionMessage");
    resultsTableContener = document.querySelector("#resultsTableContener");

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
                    connectionMessage.setAttribute("hidden", "");
                    resultsTableContener.removeAttribute("hidden");
                }).catch(function(error) {
                    console.log(error);
                    alert(error);
                });
            }
        }
    });

    formConfiguration.hostname.focus();
}