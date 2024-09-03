// The app is separated from server.js because of easier automated testing

var express = require("express")
var cors = require("cors")

var app = express()

app.use(express.json({ limit: "50mb"}))
app.use(cors())
app.use('/api/tasks', require('./api/tasks'))

module.exports = app