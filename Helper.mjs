import Fs from 'node:fs'
import Path from "node:path"

const TASKS_JSON_PATH = "./data/tasks.json"

const Helper = {
    FILES_ROOT: './data/files',
    PERSISTENCE: undefined,
    PERSISTENCE_ONDISK: 'ONDISK',
    PERSISTENCE_INMEMORY: 'INMEMORY',
    TASKS_JSON: undefined,
    WORKERS: [],

    CleanupWorkers() {
        const before10minutes = Date.now() - 1000 * 60 * 30 // Delete worker which is inactive for 30 minutes (working or offline)
        Helper.WORKERS = Helper.WORKERS.filter(worker => worker.lastpingat >= before10minutes)
    },

    LoadTasksJson: (persistence) => {
        Helper.PERSISTENCE = persistence
        Helper.TASKS_JSON = {
            Statistics: {},
            Tasks: [],
            WorkerStatistics: {},
        }
        if (persistence === Helper.PERSISTENCE_ONDISK) {
            if (!Fs.existsSync(TASKS_JSON_PATH)) {
                Fs.mkdirSync(Path.dirname(TASKS_JSON_PATH), { recursive: true })
                SaveTasksJson()
            } else {
                Helper.TASKS_JSON = JSON.parse(Fs.readFileSync(TASKS_JSON_PATH))
            }
        }
    },

    NotifyAboutWorker(workerName, taskType, status, taskId) {
        let existingWorker = Helper.WORKERS.find(worker => worker.name === workerName && worker.type === taskType)
        if (!existingWorker) {
            existingWorker = {
                name: workerName,
                type: taskType,
            }
            Helper.WORKERS.push(existingWorker)
        }
        existingWorker.status = status
        existingWorker.taskid = taskId
        existingWorker.lastpingat = Date.now()
        Helper.CleanupWorkers()
    },

    SaveTasksJson: () => {
        if (Helper.PERSISTENCE !== Helper.PERSISTENCE_ONDISK) return
        Fs.writeFileSync(TASKS_JSON_PATH, JSON.stringify(Helper.TASKS_JSON, undefined, '\t'))
    },

}

export default Helper