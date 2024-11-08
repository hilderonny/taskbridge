var fs = require("fs")
var path = require("path")
var crypto = require("crypto")
var express = require("express")
var workersApi = require("./workers")
var multer = require("multer")

function createRouter(filepath) {
        
    var upload = multer({ dest: filepath })

    var tasks = []
    var statistics = {}

    const tasksjsonpath = "./tasks.json"

    if (fs.existsSync(tasksjsonpath)) {
        const filecontent = fs.readFileSync(tasksjsonpath, "utf8")
        var jsonData = JSON.parse(filecontent)
        tasks = jsonData.tasks
        statistics = jsonData.statistics
    }

    var apiRouter = express.Router()

    // Find a task by its id
    function findTask(id) {
        return tasks.find(function(task) {
            return task.id === id
        })    
    }

    function save() {
        const content = JSON.stringify({
            tasks: tasks,
            statistics: statistics
        })
        fs.writeFileSync(tasksjsonpath, content, "utf8")
    }

    /********** APIs **********/

    // Add a task
    apiRouter.post("/add/", upload.single('file'), function(req, res) {
        var json = JSON.parse(req.body.json)
        var task = {
            id: crypto.randomUUID(),
            type: json.type,
            status: "open",
            createdat: Date.now()
        }
        if (json.data) task.data = json.data
        if (json.requirements) task.requirements = json.requirements
        if (req.file) task.file = req.file.filename
        tasks.push(task)
        save()
        res.status(200).send({
            id: task.id
        })
    })

    // Take a task for processing
    apiRouter.post('/take/', express.json(), function(req, res) {
        var type = req.body.type
        var worker = req.body.worker
        var firstMatchingTask = tasks.find(function(task) {
            return (task.type === type) && (task.status === "open")
        })
        workersApi.notifyAboutWorker(worker, type, firstMatchingTask ? "working" : "idle", firstMatchingTask ? firstMatchingTask.id : undefined)
        if (!firstMatchingTask) {
            res.status(404).send()
        } else {
            firstMatchingTask.status = "inprogress"
            firstMatchingTask.worker = worker
            firstMatchingTask.startedat = Date.now()
            save()
            res.status(200).send({
                id: firstMatchingTask.id,
                data: firstMatchingTask.data
            })
        }
    })

    // Report task progress
    apiRouter.post('/progress/:id', express.json(), function(req, res) {
        var matchingTask = findTask(req.params.id)
        if (!matchingTask) {
            res.status(404).send()
        } else {
            matchingTask.progress = parseInt(req.body.progress)
            res.status(200).send()
        }
    })

    // Report task completion
    apiRouter.post('/complete/:id', express.json({ limit: "50mb"}), function(req, res) {
        var matchingTask = findTask(req.params.id)
        if (!matchingTask) {
            res.status(404).send()
        } else {
            matchingTask.result = req.body.result
            matchingTask.completedat = Date.now()
            matchingTask.status = "completed"
            if (statistics[matchingTask.type]) {
                statistics[matchingTask.type] += 1
            } else {
                statistics[matchingTask.type] = 1
            }
            save()
            res.status(200).send()
        }
    })

    // Remove a task
    apiRouter.delete('/remove/:id', function(req, res) {
        var matchingTask = findTask(req.params.id)
        if (!matchingTask) {
            res.status(404).send()
        } else {
            tasks.splice(tasks.indexOf(matchingTask), 1)
            if (matchingTask.file) {
                var fullpath = path.join(filepath, matchingTask.file)
                fs.rmSync(fullpath)
            }
            save()
            res.status(200).send()
        }
    })

    // Restart a task
    apiRouter.get('/restart/:id', function(req, res) {
        var matchingTask = findTask(req.params.id)
        if (!matchingTask) {
            res.status(404).send()
        } else {
            matchingTask.status = "open"
            delete matchingTask.result
            delete matchingTask.worker
            delete matchingTask.startedat
            delete matchingTask.completedat
            delete matchingTask.progress
            save()
            res.status(200).send()
        }
    })

    // Get status information about a task
    apiRouter.get('/status/:id', function(req, res) {
        var matchingTask = findTask(req.params.id)
        if (!matchingTask) {
            res.status(404).send()
        } else {
            result = {
                status: matchingTask.status
            }
            if (matchingTask.progress) {
                result.progress = matchingTask.progress
            }
            res.status(200).send(result)
        }
    })

    // Get the results of a completed task
    apiRouter.get('/result/:id', function(req, res) {
        var matchingTask = findTask(req.params.id)
        if (!matchingTask) {
            res.status(404).send()
        } else {
            res.status(200).send({
                result: matchingTask.result
            })
        }
    })

    // Get all details of a task
    apiRouter.get('/details/:id', function(req, res) {
        var matchingTask = findTask(req.params.id)
        if (!matchingTask) {
            res.status(404).send()
        } else {
            res.status(200).send(matchingTask)
        }
    })

    // Get file attached to a task
    apiRouter.get("/file/:id", function(req, res) {
        var matchingTask = findTask(req.params.id)
        if (!matchingTask || !matchingTask.file) {
            res.status(404).send()
        } else {
            var fullpath = path.join(filepath, matchingTask.file)
            res.status(200).download(fullpath)
        }
    })

    // List all tasks
    apiRouter.get("/list/", function(_, res) {
        var filteredtasks = tasks.map(function(task) {
            return {
                id: task.id,
                type: task.type,
                file: task.file,
                status: task.status,
                progress: task.progress,
                createdat: task.createdat,
                startedat: task.startedat,
                completedat: task.completedat,
                worker: task.worker
            }
        })
        res.status(200).send(filteredtasks)
    })

    apiRouter.get("/statistics/", function(_, res) {
        res.status(200).send(statistics)
    })

    return apiRouter

}

module.exports = createRouter