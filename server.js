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
    app.use(express.static(WEBROOT))
} else {
    console.warn("WARNING: Environment variable WEBROOT was not set, starting without Web UI")
}

app.use('/api/tasks', require('./api/tasks'))
app.use('/api/workers', require('./api/workers'))

app.listen(PORT, () => {
    console.info("INFO: taskbridge started")
})