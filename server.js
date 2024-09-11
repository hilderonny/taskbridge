var PORT = process.env.PORT
var FILEPATH = process.env.FILEPATH

if (!PORT) {
    console.error("Environment variable PORT was not set")
    process.exit(2)
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
app.use('/api/tasks', require('./api/tasks'))
app.use('/api/workers', require('./api/workers'))

app.listen(PORT, () => {
    console.log(`Task bridge listening on port ${PORT}`)
})