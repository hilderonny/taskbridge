import Fs from 'node:fs'
import Helper from '../Helper.mjs'
import Path from 'node:path'

const TASK_STATUS_COMPLETED = 'completed'
const TASK_STATUS_INPROGRESS = 'inprogress'
const TASK_STATUS_OPEN = 'open'
const WORKER_STATUS_IDLE = 'idle'
const WORKER_STATUS_WORKING = 'working'

function findTaskById(taskId) {
    return Helper.TASKS_JSON.tasks.find(task => task.id === taskId)
}

export default {

    Add(request, response) {
        const bodyJson = JSON.parse(request.body.json)
        const newTask = {
            createdat: Date.now(),
            data: bodyJson.data,
            file: request.file?.filename,
            id: crypto.randomUUID(),
            progress: 0,
            requirements: bodyJson.requirements,
            status: TASK_STATUS_OPEN,
            type: bodyJson.type,
        }
        Helper.TASKS_JSON.tasks.push(newTask)
        Helper.SaveTasksJson()
        response.json({
            id: newTask.id
        })
    },

    Complete(request, response) {
        const task = findTaskById(request.params.taskId)
        if (!task) {
            response.sendStatus(404)
        } else {
            task.result = request.body.result
            task.completedat = Date.now()
            task.status = TASK_STATUS_COMPLETED
            if (Helper.TASKS_JSON.statistics[task.type]) {
                Helper.TASKS_JSON.statistics[task.type] += 1
            } else {
                Helper.TASKS_JSON.statistics[task.type] = 1
            }
            Helper.SaveTasksJson()
            response.sendStatus(200)
        }
    },

    Details(request, response) {
        const task = findTaskById(request.params.taskId)
        if (!task) {
            response.sendStatus(404)
        } else {
            response.json(task)
        }
    },

    File(request, response) {
        const task = findTaskById(request.params.taskId)
        if (!task?.file) {
            response.sendStatus(404)
        } else {
            response.download(Path.join(Helper.FILES_ROOT, task.file))
        }
    },

    List(_, response) {
        response.json(Helper.TASKS_JSON.tasks.map(task => { return {
            completedat: task.completedat,
            createdat: task.createdat,
            file: task.file,
            id: task.id,
            progress: task.progress,
            startedat: task.startedat,
            status: task.status,
            type: task.type,
            worker: task.worker,
        }}))
    },

    Progress(request, response) {
        const task = findTaskById(request.params.taskId)
        if (!task) {
            response.sendStatus(404)
        } else {
            task.progress = parseInt(request.body.progress)
            Helper.SaveTasksJson()
            response.sendStatus(200)
        }
    },

    Remove(request, response) {
        const index = Helper.TASKS_JSON.tasks.findIndex(task => task.id === request.params.taskId)
        if (index < 0) {
            response.sendStatus(404)
        } else {
            const file = Helper.TASKS_JSON.tasks[index].file
            if (file) {
                Fs.rmSync(Path.join(Helper.FILES_ROOT, file))
            }
            Helper.TASKS_JSON.tasks.splice(index, 1)
            Helper.SaveTasksJson()
            response.sendStatus(200)
        }
    },

    Restart(request, response) {
        const task = findTaskById(request.params.taskId)
        if (!task) {
            response.sendStatus(404)
        } else {
            task.progress = 0
            task.status = TASK_STATUS_OPEN
            Helper.SaveTasksJson()
            response.sendStatus(200)
        }
    },

    Result(request, response) {
        const task = findTaskById(request.params.taskId)
        if (!task) {
            response.sendStatus(404)
        } else {
            response.json({
                result: task.result
            })
        }
    },

    Statistics(_, response) {
        response.json(Helper.TASKS_JSON.statistics)
    },

    Status(request, response) {
        const task = findTaskById(request.params.taskId)
        if (!task) {
            response.sendStatus(404)
        } else {
            response.json({
                progress: task.progress,
                status: task.status,
            })
        }
    },

    Take(request, response) {
        const taskType = request.body.type
        const workerName = request.body.worker
        const firstMatchingTask = Helper.TASKS_JSON.tasks.find(task => {
            if (task.status !== TASK_STATUS_OPEN || task.type !== taskType) return false
            const abilities = request.body.abilities
            if (task.requirements) {
                if (!abilities) return false
                for (const [ key, value ] of Object.entries(task.requirements)) {
                    const ability = abilities[key]
                    if (!ability || ability !== value) return false
                }
            }
            return true
        })
        Helper.NotifyAboutWorker(workerName, taskType, firstMatchingTask ? WORKER_STATUS_WORKING : WORKER_STATUS_IDLE, firstMatchingTask?.id)
        if (!firstMatchingTask) {
            response.sendStatus(404)
        } else {
            firstMatchingTask.status = TASK_STATUS_INPROGRESS
            firstMatchingTask.worker = workerName
            firstMatchingTask.startedat = Date.now()
            Helper.SaveTasksJson()
            response.json({
                id: firstMatchingTask.id,
                data: firstMatchingTask.data,
            })
        }
    },

    WorkerStatistics(_, response) {
        response.json(Helper.TASKS_JSON.workerstatistics)
    },

}