var FILEPATH = process.env.FILEPATH

var fs = require("fs")
var path = require("path")
var crypto = require("crypto")
var express = require("express")
var workersApi = require("./workers")
var multer = require("multer")
var upload = multer({ dest: FILEPATH })

var tasks = []

var apiRouter = express.Router()

// Find a task by its id
function findTask(id) {
    return tasks.find(function(task) {
        return task.id === id
    })    
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
    res.status(200).send({
        id: task.id
    })
})

// Take a task for processing
apiRouter.post('/take/', express.json(), function(req, res) {
    var type = req.body.type
    var worker = req.body.worker
    var abilities = req.body.abilities || {}
    var firstMatchingTask = tasks.find(function(task) {
        if (task.status !== "open") return false
        if (task.type !== type) return false
        if (task.requirements) {
            for (var [key, value] of Object.entries(task.requirements)) {
                var ability = abilities[key]
                if (!ability) return false
                if (ability !== value) return false
            }
        }
        return true
    })
    workersApi.notifyAboutWorker(worker, type, firstMatchingTask ? "working" : "idle", firstMatchingTask ? firstMatchingTask.id : undefined)
    if (!firstMatchingTask) {
        res.status(404).send()
    } else {
        firstMatchingTask.status = "inprogress"
        firstMatchingTask.worker = worker
        firstMatchingTask.startedat = Date.now()
        res.status(200).send({
            id: firstMatchingTask.id,
            data: firstMatchingTask.data
        })
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
        if (!tasks.taskcount[matchingTask.type]) {
            tasks.taskcount[matchingTask.type] = 0
        }
        tasks.taskcount[matchingTask.type] += 1
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
            var fullpath = path.join(FILEPATH, matchingTask.file)
            fs.rmSync(fullpath)
        }
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
        res.status(200).send()
    }
})

// Get status information about a task
apiRouter.get('/status/:id', function(req, res) {
    var matchingTask = findTask(req.params.id)
    if (!matchingTask) {
        res.status(404).send()
    } else {
        res.status(200).send({
            status: matchingTask.status
        })
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
        var fullpath = path.join(FILEPATH, matchingTask.file)
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
            createdat: task.createdat,
            startedat: task.startedat,
            completedat: task.completedat,
            worker: task.worker
        }
    })
    res.status(200).send(filteredtasks)
})

module.exports = apiRouter