// Show version if requested and quit
if (process.argv.includes("--version")) {
    var { version } = require("./package.json")
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

if (WEBROOT) {
    console.info(`INFO: Using WEBROOT ${WEBROOT}`)
} else {
    console.warn("WARNING: Environment variable WEBROOT was not set, starting without Web UI")
}

const createApp = require("./app.js")

createApp(FILEPATH, WEBROOT).listen(PORT, () => {
    console.info("INFO: taskbridge started")
})