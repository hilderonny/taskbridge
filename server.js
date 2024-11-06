// Show version if requested and quit
if (process.argv.includes('--version')) {
    var { version } = require('./package.json')
    console.log(version)
    process.exit(0)
}

var PORT = process.env.PORT
var FILEPATH = process.env.FILEPATH
var WEBROOT = process.env.WEBROOT

if (PORT) {
    console.info(`INFO: Using PORT ${PORT}`)
} else {
    console.error("ERROR: Environment variable PORT was not set")
    process.exit(2)
}

if (FILEPATH) {
    console.info(`INFO: Using FILEPATH ${FILEPATH}`)
} else {
    console.error("ERROR: Environment variable FILEPATH was not set")
    process.exit(4)
}

var express = require("express")
var cors = require("cors")

var app = express()
app.use(cors())

if (WEBROOT) {
    console.info(`INFO: Using WEBROOT ${WEBROOT}`)
    app.use(express.static(WEBROOT.trim())) // Remove trailing spaces
} else {
    console.warn("WARNING: Environment variable WEBROOT was not set, starting without Web UI")
}

app.use('/api/tasks', require('./api/tasks'))
app.use('/api/workers', require('./api/workers'))
app.use('/api/version', require('./api/version'))

// API documentation with OpenAPI, see https://medium.com/wolox/documenting-a-nodejs-rest-api-with-openapi-3-swagger-5deee9f50420
var swaggerUi = require("swagger-ui-express");
var swaggerDocs = require("./openApiDocumentation")
app.use("/apidoc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
    console.info("INFO: taskbridge started")
})