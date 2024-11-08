const request = require("supertest")

const app = require("../../app.js")("./testupload", "./testwebroot")

const OLDWORKERTIME = new Date('2024-11-07T01:30:00.000Z').valueOf()
const WORKERTIME = new Date('2024-11-07T02:00:00.000Z').valueOf()
const FETCHTIME = new Date('2024-11-07T02:02:00.000Z').valueOf()

afterEach(() => {
  // Clear all mocks
  jest.restoreAllMocks()
})

describe("GET /api/workers/list/", () => {

  it("should return empty list if no worker is present", async() => {
    const res = await request(app).get("/api/workers/list/").send()
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual([])
  })

  it("should return worker list with name, type, status and lastping properties", async() => {
    // Mock date for worker creation
    jest.spyOn(global.Date, "now").mockImplementation(() => WORKERTIME)
    // Trigger worker creation
    const workername = "TEST_WORKER_NAME"
    const tasktype = "TEST_TASK_TYPE"
    const status = "TEST_STATUS"
    const taskid = "TEST_TASK_ID"
    require("../../api/workers.js").notifyAboutWorker(workername, tasktype, status, taskid)
    // Mock date for request
    jest.spyOn(global.Date, "now").mockImplementation(() => FETCHTIME)
    // Fetch worker list
    const res = await request(app).get("/api/workers/list/").send()
    expect(res.statusCode).toEqual(200)
    const list = res.body
    expect(list.length).toEqual(1)
    const firstworker = list[0]
    expect(firstworker.name).toEqual(workername)
    expect(firstworker.type).toEqual(tasktype)
    expect(firstworker.status).toEqual(status)
    expect(firstworker.taskid).toEqual(taskid)
    expect(firstworker.lastping).toEqual(FETCHTIME - WORKERTIME)
  })

  it("should return worker without taskid when worker has no task to do", async() => {
    // Mock date for worker creation
    jest.spyOn(global.Date, "now").mockImplementation(() => WORKERTIME)
    // Trigger worker creation
    const workername = "TEST_WORKER_NAME"
    const tasktype = "TEST_TASK_TYPE"
    const status = "TEST_STATUS"
    const taskid = undefined
    require("../../api/workers.js").notifyAboutWorker(workername, tasktype, status, taskid)
    // Mock date for request
    jest.spyOn(global.Date, "now").mockImplementation(() => FETCHTIME)
    // Fetch worker list
    const res = await request(app).get("/api/workers/list/").send()
    expect(res.statusCode).toEqual(200)
    const list = res.body
    expect(list.length).toEqual(1)
    const firstworker = list[0]
    expect(firstworker).not.toHaveProperty("taskid")
  })

  it("should not return workers older than 30 minutes", async() => {
    // Mock date for worker creation
    let calledonce = false
    jest.spyOn(global.Date, "now").mockImplementation(() => {
      // Make sure that the second call in cleanupWorkers() will get newer time
      if (calledonce) { // cleanupWorkers()
        return FETCHTIME
      } else { // notifyAboutWorker()
        calledonce = true
        return OLDWORKERTIME
      }
    })
    // Trigger worker creation
    const workername = "TEST_WORKER_NAME"
    const tasktype = "TEST_TASK_TYPE"
    const status = "TEST_STATUS"
    const taskid = "TEST_TASK_ID"
    require("../../api/workers.js").notifyAboutWorker(workername, tasktype, status, taskid)
    // Mock date for request
    jest.spyOn(global.Date, "now").mockImplementation(() => FETCHTIME)
    // Fetch worker list
    const res = await request(app).get("/api/workers/list/").send()
    expect(res.statusCode).toEqual(200)
    const list = res.body
    expect(list).toEqual([])
  })

})