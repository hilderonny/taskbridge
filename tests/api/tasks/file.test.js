var fs = require("fs")
var path = require("path")
const request = require("supertest")

const createApp = require("../../../app.js")
const tasksjsonpath = "./tasks.json"
let app, filemocks, writefilemock

beforeEach(() => {
  // Mock file reading
  filemocks = {}
  // Provide package.json content for version reading and so, it is accessed by absolute path
  const packagejsonpath = path.join(__dirname, "../../../package.json")
  filemocks[packagejsonpath] = fs.readFileSync(packagejsonpath)
  jest.spyOn(fs, "existsSync").mockImplementation((filepath) => !!filemocks[filepath])
  jest.spyOn(fs, "readFileSync").mockImplementation((filepath) => filemocks[filepath])
  writefilemock = jest.spyOn(fs, "writeFileSync").mockImplementation((filepath, content) => { filemocks[filepath] = content })
  jest.spyOn(fs, "rmSync").mockImplementation((filepath) => { delete filemocks[filepath] })
})

afterEach(() => {
  // Clear all mocks
  jest.restoreAllMocks()
})

describe("GET /api/tasks/file/", () => {

  it("should return 404 when there is no task with the given id", async() => {
    const taskid = "TASK_ID"
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = '{"tasks":[]}'
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).get(`/api/tasks/file/${taskid}`).send()
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should return 404 when the task has no file", async() => {
    const taskid = "TASK_ID"
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "open", id: taskid }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).get(`/api/tasks/file/${taskid}`).send()
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should download the attached file if there is a matching task", async() => {
    const taskid = "TASK_ID"
    const filename = "TASK_FILE_NAME"
    const filecontent = "FILE_CONTENT"
    const uploadpath = "./testupload"
    const fullpath = path.join(uploadpath, filename)
    // Prepare stored file
    writefilemock.mockRestore()
    fs.writeFileSync(fullpath, filecontent, "utf8")
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "inprogress", id: taskid, file: filename }
      ]
    })
    // Create app
    app = createApp(uploadpath, "./testwebroot")
    // Call API
    const res = await request(app).get(`/api/tasks/file/${taskid}`).send()
    // Analyze response
    expect(res.statusCode).toEqual(200)
    expect(res.headers["content-disposition"]).toEqual(`attachment; filename="${filename}"`)
    expect(res.body).toEqual(Buffer.from(filecontent))
  })

})