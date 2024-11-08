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

describe("GET /api/tasks/statistics/", () => {

  it("should return 200 and all given task statistics", async() => {
    const statistics = { 
      "Type_1": 100,
      "Type_2": 200,
      "Type_3": 300
    }
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [],
      statistics: statistics
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).get("/api/tasks/statistics/").send()
    // Analyze response
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual(statistics)
  })

})