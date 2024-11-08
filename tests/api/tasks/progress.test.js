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
})

afterEach(() => {
  // Clear all mocks
  jest.restoreAllMocks()
})

describe("POST /api/tasks/progress/", () => {

  it("should return 404 when there is no task with the given id", async() => {
    const taskid = "TASK_ID"
    const progress = 55
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = '{"tasks":[]}'
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post(`/api/tasks/progress/${taskid}`).send({
      progress: progress
    })
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should update the progress of the task and return 200 when a matching task is found", async() => {
    const taskid = "TASK_ID"
    const progress = 55
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "inprogress", id: taskid }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post(`/api/tasks/progress/${taskid}`).send({
      progress: progress
    })
    // Analyze response
    expect(res.statusCode).toEqual(200)
    // Analyze Task
    const taskresponse = await request(app).get(`/api/tasks/details/${taskid}`).send()
    expect(taskresponse.statusCode).toEqual(200)
    expect(taskresponse.body.progress).toEqual(progress)
  })

  it("should not save the progress in the tasks file", async() => {
    const taskid = "TASK_ID"
    const progress = 55
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "inprogress", id: taskid }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post(`/api/tasks/progress/${taskid}`).send({
      progress: progress
    })
    // Analyze response
    expect(res.statusCode).toEqual(200)
    // Analyze stored tasks
    const storedtasks = JSON.parse(filemocks[tasksjsonpath])
    expect(storedtasks.tasks.length).toEqual(1)
    const firsttask = storedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask).not.toHaveProperty("progress")
  })

})