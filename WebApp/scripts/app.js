var formConfiguration, connectionMessage, resultsTableContener;
var configuration = {};

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
                console.log(configuration);

                formConfiguration.parentNode.setAttribute("hidden", "");
                connectionMessage.removeAttribute("hidden");

                // TODO -> get all results from API and the start MQTT connection
                var client = mqtt.connect("ws://"+ configuration.hostname + ":" + configuration.mqttPort + "/mqtt");
                
                // Connect event
                client.on("connect", function(connack) {
                    console.log("Connected !");
                    connectionMessage.setAttribute("hidden", "");
                    resultsTableContener.removeAttribute("hidden", "");
                    // Start subscribe to the results topic
                    client.subscribe("results");
                });

                // Error event
                client.on("error", function(connack) {
                    console.log("Connection Error !");
                });
            }
        }
    });

    formConfiguration.hostname.focus();
}