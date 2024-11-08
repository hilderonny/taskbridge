var fs = require("fs")
var path = require("path")
const request = require("supertest")

const createApp = require("../../../app.js")
const tasksjsonpath = "./tasks.json"
let app, filemocks

beforeEach(() => {
  // Mock file reading
  filemocks = {}
  // Provide package.json content for version reading and so, it is accessed by absolute path
  const packagejsonpath = path.join(__dirname, "../../../package.json")
  filemocks[packagejsonpath] = fs.readFileSync(packagejsonpath)
  jest.spyOn(fs, "existsSync").mockImplementation((filepath) => !!filemocks[filepath])
  jest.spyOn(fs, "readFileSync").mockImplementation((filepath) => filemocks[filepath])
  jest.spyOn(fs, "writeFileSync").mockImplementation((filepath, content) => { filemocks[filepath] = content })
  jest.spyOn(fs, "rmSync").mockImplementation((filepath) => { delete filemocks[filepath] })
})

afterEach(() => {
  // Clear all mocks
  jest.restoreAllMocks()
})

describe("POST /api/tasks/restart/", () => {

  it("should return 404 when there is no task with the given id", async() => {
    const taskid = "TASK_ID"
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = '{"tasks":[]}'
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).get(`/api/tasks/restart/${taskid}`).send()
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should return 200 when a task with the given id was found", async() => {
    const taskid = "TASK_ID"
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "inprogress", id: taskid }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).get(`/api/tasks/restart/${taskid}`).send()
    // Analyze response
    expect(res.statusCode).toEqual(200)
  })

  it("should save the task and set the task status to open and delete the result, worker, startedat, completedat and progress properties", async() => {
    const taskid = "TASK_ID"
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { 
          type: "TYPE_TO_TEST", 
          status: "inprogress", 
          id: taskid,
          result: "task result", 
          worker: "task_worker",
          startedat: new Date('2024-11-07T02:00:00.000Z').valueOf(),
          completedat: new Date('2024-11-07T02:00:00.000Z').valueOf(),
          progress: 100
        }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    await request(app).get(`/api/tasks/restart/${taskid}`).send()
    // Analyze stored tasks
    const storedtasks = JSON.parse(filemocks[tasksjsonpath])
    expect(storedtasks.tasks.length).toEqual(1)
    const firsttask = storedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask.status).toEqual("open")
    expect(firsttask).not.toHaveProperty("result")
    expect(firsttask).not.toHaveProperty("worker")
    expect(firsttask).not.toHaveProperty("startedat")
    expect(firsttask).not.toHaveProperty("completedat")
    expect(firsttask).not.toHaveProperty("progress")
  })

})