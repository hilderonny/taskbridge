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

var express = require("express")
var cors = require("cors")

function createApp(filepath, webroot) {
    var app = express()
    app.use(cors())
    
    if (webroot) {
        app.use(express.static(webroot.trim())) // Remove trailing spaces
    }
    
    app.use('/api/tasks', require('./api/tasks')(filepath))
    app.use('/api/workers', require('./api/workers'))
    app.use('/api/version', require('./api/version'))
    
    // API documentation with OpenAPI, see https://medium.com/wolox/documenting-a-nodejs-rest-api-with-openapi-3-swagger-5deee9f50420
    var swaggerUi = require("swagger-ui-express");
    var swaggerDocs = require("./openApiDocumentation")
    app.use("/apidoc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    return app
}

module.exports = createApp