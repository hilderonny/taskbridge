var PORT = process.env.PORT
var TASKFILE = process.env.TASKFILE
var SAVEINTERVAL = process.env.SAVEINTERVAL

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

var express = require("express")
var cors = require("cors")

var app = express()
app.use(express.json({ limit: "50mb"}))
app.use(cors())
app.use(express.static("public"))
app.use('/api/v1/tasks', require('./api/v1/tasks'))

app.listen(PORT, () => {
    console.log(`Task bridge listening on port ${PORT}`)
})