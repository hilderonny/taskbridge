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

describe("POST /api/tasks/status/", () => {

  it("should return 404 when there is no task with the given id", async() => {
    const taskid = "TASK_ID"
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = '{"tasks":[]}'
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).get(`/api/tasks/status/${taskid}`).send()
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should return 200 and the task status when a task with the given id was found", async() => {
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
    const res = await request(app).get(`/api/tasks/status/${taskid}`).send()
    // Analyze response
    expect(res.statusCode).toEqual(200)
    expect(res.body.status).toEqual("inprogress")
  })

  it("should return task progress when set", async() => {
    const taskid = "TASK_ID"
    const progress = 55
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "inprogress", id: taskid, progress: progress }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).get(`/api/tasks/status/${taskid}`).send()
    // Analyze response
    expect(res.statusCode).toEqual(200)
    expect(res.body.progress).toEqual(progress)
  })

})