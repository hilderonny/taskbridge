var PORT = process.env.PORT
var TASKFILE = process.env.TASKFILE

if (!PORT) {
    console.error("Environment variable PORT was not set")
    process.exit(2)
}

if (!TASKFILE) {
    console.error("Environment variable TASKFILE was not set")
    process.exit(3)
}

var express = require("express")
var app = express()
app.use(express.json({ limit: "50mb"}))

var cors = require("cors")
app.use(cors())

app.use('/api/tasks', require('./api/tasks'))

app.listen(PORT, () => {
    console.log(`Task bridge listening on port ${PORT}`)
})