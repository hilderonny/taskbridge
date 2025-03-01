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

var workers = {}
var apiRouter = express.Router()

apiRouter.notifyAboutWorker = function(name, type, status, taskid) {
    const identifier = name + type
    var worker = workers[identifier]
    if (!worker) {
        worker = {
            name: name,
            type: type
        }
        workers[identifier] = worker
    }
    worker.status = status
    worker.taskid = taskid
    worker.lastpingat = Date.now()
    cleanupWorkers()
}

function cleanupWorkers() {
    const before10minutes = Date.now() - 1000 * 60 * 30 // Delete worker which is inactive for 30 minutes (working or offline)
    for (const identifier in workers) {
        const worker = workers[identifier]
        if (worker.lastpingat < before10minutes) {
            delete workers[identifier]
        }
    }
}

/********** APIs **********/

// List all workers
apiRouter.get("/list/", function(_, res) {
    var now = Date.now()
    var workersToSend = Object.values(workers).map(worker => { 
        var workerToReturn = {
            name: worker.name,
            type: worker.type,
            status: worker.status,
            lastping: now - worker.lastpingat
        }
        if (worker.taskid) workerToReturn.taskid = worker.taskid
        return workerToReturn
    })
    res.status(200).send(workersToSend)
})

module.exports = apiRouter