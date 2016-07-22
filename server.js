var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var minimist = require('minimist');

//
// Listen for requests triggered by GitHub for eventype "CreatedEvent".
//   it only process "tags" created events and triggers a new build for that
//   tag as a branch in wercker.
//
// You need to provide some parameters:
//    - secret: a string that is expected as "secret" parameter as part of the GitHub
//          request. This way we avoid anyone from triggering builds manually.
//    - port: the port you want this to listen
//    - wercker-token: a token generated in wercker UI to call wercker API.
//    - wercker-api-id: the id of the wercker application
//    - wercker-pipeline-id: the id of the wercker pipeline you want to launch.
//
// Usage:
//   --secret=your_secret
//   --port=3001   # optional
//   --wercker-token="asdadasd"
//   --wercker-app-id="23453"
//   --wercker-pipeline-id="23453"
//

const options = minimist(process.argv.slice(2))

var port = options.port || process.env.PORT || 3001

var app = express();
app.use(bodyParser.json());

console.log("Running with options")
for (var e in options) {
    console.log("\t" + e + " = " + options[e])
}

var WERCKER_TOKEN = getParam('wercker-token')
var WERCKER_APP_ID = getParam('wercker-app-id')
var WERCKER_PIPELINE_ID = getParam('wercker-pipeline-id')
var SECRET = getParam('secret')


app.post('/created/:secret', function(req, res) {
    if (!req.params.secret || req.params.secret != SECRET) {
        res.status(401).json({status:"error", message:"Not Authorized"})
        return
    }
    else if (req.body && req.body.ref_type && req.body.ref_type === "tag") {
        var tagName = req.body.ref
        console.log("Triggering build for tag " + tagName)

        request({
            method: "POST",
            url: 'https://app.wercker.com/api/v3/runs',
            headers: {
                'Authorization': 'Bearer ' + WERCKER_TOKEN,
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                applicationId : WERCKER_APP_ID,
                pipelineId: WERCKER_PIPELINE_ID,
                branch: tagName
            })
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                res.status(200).json({ status:"ok", message: result })
                console.log(result)
            }
            else {
                res.status(500).json({
                    status: 'error',
                    message: 'Wercker responded with http code different than 200',
                    code: response.statusCode,
                    cause: error
                })
            }
        });
    }
    else {
        res.status(500).json({status: "error", message: "Incorrect body payload"});
    }
});

app.listen(port);
console.log('Listening on port 3001...');


// utils

function getParam(name) {
    var value = options[name]
    if (!value)
        throw new Error("You must provide the argument --" + name + "=some_value")
    return value
}