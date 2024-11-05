var express = require("express")
var { version } = require('../package.json')

var apiRouter = express.Router()

// Return version of taskbridge
apiRouter.get("/", function(_, res) {
    res.status(200).send(version)
})

module.exports = apiRouter