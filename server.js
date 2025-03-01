/**
 * Copyright 2025 hilderonny
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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