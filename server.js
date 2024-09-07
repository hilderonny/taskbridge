var PORT = process.env.PORT
var TASKFILE = process.env.TASKFILE
var SAVEINTERVAL = process.env.SAVEINTERVAL
var FILEPATH = process.env.FILEPATH

if (!PORT) {
    console.error("Environment variable PORT was not set")
    process.exit(2)
}

if (!TASKFILE) {
    console.error("Environment variable TASKFILE was not set")
    process.exit(3)
}

if (!SAVEINTERVAL) {
    console.error("Environment variable SAVEINTERVAL was not set")
    process.exit(4)
}

if (!FILEPATH) {
    console.error("Environment variable FILEPATH was not set")
    process.exit(4)
}

var express = require("express")
var cors = require("cors")

var app = express()
app.use(cors())
app.use(express.static("public"))
//app.use('/api/v1/tasks', require('./api/v1/tasks')) // Hier kommt es zu Konflikten mit tasks.json
app.use('/api/v2/tasks', require('./api/v2/tasks'))
app.use('/api/v1/workers', require('./api/v1/workers'))

app.listen(PORT, () => {
    console.log(`Task bridge listening on port ${PORT}`)
})