var TASKFILE = process.env.TASKFILE
var SAVEINTERVAL = process.env.SAVEINTERVAL

var fs = require("fs")
var crypto = require("crypto")
var tasks = []
var isDirty = false // Flag for signalling that the tasks have changed since last file save

var express = require("express")
const apiRouter = express.Router()

// Load tasks file or create a new one
fs.readFile(TASKFILE, "utf8", (error, data) => {
    if (error) {
        console.error(`Task file "${TASKFILE}" could not be opened for reading. Creating a new one...`)
        saveTasks()
    } else {
        tasks = JSON.parse(data)
    }
})

// Save tasks to disk
function saveTasks() {
    fs.writeFileSync(TASKFILE, JSON.stringify(tasks, null, 2), "utf8");
}

// Find a task by its id
function findTask(id) {
    return tasks.find(function(task) {
        return task.id === id
    })    
}

// Check once in a minute whether tasks should be written to disk
setInterval(() => {
    if (isDirty) {
        isDirty = false
        saveTasks()
    }
}, SAVEINTERVAL)

/********** APIs **********/

// Add a task
apiRouter.post("/add/", function(req, res) {
    var task = {
        id: crypto.randomUUID(),
        type: req.body.type,
        requirements: req.body.requirements,
        status: "open",
        createdat: Date.now(),
        data: req.body.data
    }
    tasks.push(task)
    isDirty = true
    res.status(200).send({
        id: task.id
    })
})

// Take a task for processing
apiRouter.post('/take/', function(req, res) {
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
    if (!firstMatchingTask) {
        res.status(404).send()
    } else {
        firstMatchingTask.status = "inprogress"
        firstMatchingTask.worker = worker
        firstMatchingTask.startedat = Date.now()
        isDirty = true
        res.status(200).send({
            id: firstMatchingTask.id,
            data: firstMatchingTask.data
        })
    }
})

// Report task completion
apiRouter.post('/complete/:id', function(req, res) {
    var matchingTask = findTask(req.params.id)
    if (!matchingTask) {
        res.status(404).send()
    } else {
        matchingTask.result = req.body.result
        matchingTask.completedat = Date.now()
        matchingTask.status = "completed"
        isDirty = true
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
        isDirty = true
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
        isDirty = true
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

// List all tasks
apiRouter.get("/list/", function(_, res) {
    var filteredtasks = tasks.map(function(task) {
        return {
            id: task.id,
            type: task.type,
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