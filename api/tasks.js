var TASKFILE = process.env.TASKFILE

var fs = require("fs")
var crypto = require("crypto")
var tasks = []

var express = require("express")
const apiRouter = express.Router()

fs.readFile(TASKFILE, "utf8", (error, data) => {
    if (error) {
        console.error(`Task file "${TASKFILE}" could not be opened for reading. Creating a new one...`)
        saveTasks()
    } else {
        for (var task of JSON.parse(data)) {
            tasks.push(task)
        }
    }
})

function saveTasks() {
    fs.writeFileSync(TASKFILE, JSON.stringify(tasks, null, 2), "utf8");
}

// Get list of all tasks
apiRouter.get("/", function(_, res) {
    var filteredtasks = tasks.map(function(task) {
        return {
            id: task.id,
            type: task.type,
            status: task.status,
            createdat: task.createdat,
            startedat: task.startedat
        }
    })
    res.send(filteredtasks)
})

// Fetch task result (complete details) and remove it from queue
apiRouter.get("/result/:taskid", function(req, res) {
    var taskid = req.params.taskid
    var matchingtask = tasks.find(function(task) {
        return task.id === taskid
    })
    if (matchingtask) {
        tasks.splice(tasks.indexOf(matchingtask), 1)
        res.send(matchingtask)
    } else {
        res.status(404).send({ error: "TaskNotFound" })
    }
})

// Get status of a task
apiRouter.get("/status/:taskid", function(req, res) {
    var taskid = req.params.taskid
    var matchingtask = tasks.find(function(task) {
        return task.id === taskid
    })
    if (matchingtask) {
        res.send({
            status: matchingtask.status
        })
    } else {
        res.status(404).send({ error: "TaskNotFound" })
    }
})

// Add a new task
apiRouter.post("/add/:type", function(req, res) {
    var task = {
        id: crypto.randomUUID(),
        type: req.params.type,
        status: "open",
        createdat: Date.now(),
        data: req.body
    }
    tasks.push(task)
    saveTasks()
    res.send({ id: task.id })
})

// Take a task for processing
apiRouter.get('/take/:type', function(req, res) {
    var firstMatchingTask = tasks.find(function(task) {
        return task.status === "open" && task.type === req.params.type
    })
    if (!firstMatchingTask) {
        res.status(404).send({ error: "NoTask" })
    } else {
        firstMatchingTask.status = "inprogress"
        firstMatchingTask.startedat = Date.now()
        saveTasks()
        res.send(firstMatchingTask)
    }
})

// Report task completion
apiRouter.post('/finish/:taskid', function(req, res) {
    var taskid = req.params.taskid
    var matchingTask = tasks.find(function(task) {
        return task.id === taskid
    })
    if (!matchingTask) {
        res.status(404).send({ error: "TaskNotFound" })
        return
    }
    matchingTask.result = req.body
    matchingTask.completedat = Date.now()
    matchingTask.status = "done"
    saveTasks()
    res.send()
})

module.exports = apiRouter