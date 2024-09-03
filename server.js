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

var app = require("./app")

app.listen(PORT, () => {
    console.log(`Task bridge listening on port ${PORT}`)
})