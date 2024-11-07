var fs = require("fs")
const request = require("supertest")

const createApp = require("../../../app.js")
const tasksjsonpath = "./tasks.json"
let app

beforeEach(() => {
  // Delete tasks.json file
  if (fs.existsSync(tasksjsonpath)) {
    fs.unlinkSync(tasksjsonpath)
  }
  // Create app
  app = createApp("./testupload", "./testwebroot")
})

describe("GET /api/tasks/list/", () => {

  it("should return empty list if no task is present", async() => {
    const res = await request(app).get("/api/tasks/list/").send()
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual([])
  })

  it("should return existing tasks with properties id, type, file, status, progress, createdat, startedat, completedat and worker", async() => {
    fs.writeFileSync(tasksjsonpath, JSON.stringify({
      tasks: [
        /*
        {
          id: task.id,
          type: task.type,
          file: task.file,
          status: task.status,
          progress: task.progress,
          createdat: task.createdat,
          startedat: task.startedat,
          completedat: task.completedat,
          worker: task.worker
        }
          */
      ]
    }), "utf8")
  })

})