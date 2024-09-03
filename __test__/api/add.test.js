process.env.TASKFILE = "./testdata/tasks.json"
process.env.SAVEINTERVAL = 100 // 100 Milliseconds

const fs = require("fs")
const request = require("supertest")
const app = require("../../app")

beforeEach(() => {
    if (!fs.existsSync("./testdata")) fs.mkdirSync("./testdata")
})

afterEach(() => {
    if (fs.existsSync("./testdata")) fs.rmdirSync("./testdata", { recursive: true, force: true })
})

function createNewTask() {
    return {
        type: "translate",
        requirements: {
            "sourcelanguage": "en",
            "targetlanguage": "de"
        },
        data: "Testdata"
    }
}

async function waitForTaskFileSaving() {
    await new Promise((r) => setTimeout(r, 200))
}

async function loadTaskFileAfterSaving() {
    await waitForTaskFileSaving()
    var filecontent = fs.readFileSync(process.env.TASKFILE, "utf8")
    return JSON.parse(filecontent)
}

describe("POST /api/tasks/add/", () => {

    it("should return HTTP 200 and id in JSON", async () => {
        var task = createNewTask()
        var response = await request(app)
            .post("/api/tasks/add/")
            .send(task)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
        var taskId = response.body.id
        expect(taskId).toBeDefined()
        await waitForTaskFileSaving()
    })

    it("should save the task on disk", async () => {
        var task = createNewTask()
        var response = await request(app)
            .post("/api/tasks/add/")
            .send(task)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200)
        var taskId = response.body.id
        var taskswritten = await loadTaskFileAfterSaving()
        expect(taskswritten).toBeDefined()
        console.log(taskswritten)
        expect(taskswritten.length).toBe(1)
        var writtentask = taskswritten[0]
        expect(writtentask.id).toBe(taskId)
        expect(writtentask.type).toBe(task.type)
        expect(writtentask.requirements).toStrictEqual(task.requirements)
        expect(writtentask.status).toBe("open")
        expect(writtentask.createdat).toBeDefined()
        expect(writtentask.data).toStrictEqual(task.data)
    })

})