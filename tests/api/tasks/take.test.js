/**
 * Copyright 2025 hilderonny
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

describe("POST /api/tasks/take/", () => {

  it("should return 404 if there are no tasks at all", async() => {
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = '{"tasks":[]}'
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post("/api/tasks/take/").send({
      type: "TYPE_TO_TEST"
    })
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should return 404 if there is no task with matching type", async() => {
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "ANOTHER_TASK_TYPE", status: "open" }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post("/api/tasks/take/").send({
      type: "TYPE_TO_TEST"
    })
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should return 404 if there is no open matching task", async() => {
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "inprogress" }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post("/api/tasks/take/").send({
      type: "TYPE_TO_TEST"
    })
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should return the id and data structure of the first matching task", async() => {
    const data = { this: { is: "my data" } }
    const taskid = "TASK_ID"
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "open", data: data, id: taskid }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post("/api/tasks/take/").send({
      type: "TYPE_TO_TEST"
    })
    // Analyze response
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("id")
    expect(res.body.id).toEqual(taskid)
    expect(res.body).toHaveProperty("data")
    expect(res.body.data).toEqual(data)
  })

  it("should save the matching task to disk including startedat, status and worker", async() => {
    const data = { this: { is: "my data" } }
    const taskid = "TASK_ID"
    const workername = "TASK_WORKER"
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "open", data: data, id: taskid }
      ]
    })
    // Mock creation date
    const startedat = new Date('2024-11-07T02:00:00.000Z').valueOf()
    jest.spyOn(global.Date, "now").mockImplementation(() => startedat)
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    await request(app).post("/api/tasks/take/").send({
      type: "TYPE_TO_TEST",
      worker: workername
    })
    // Analyze task storage
    const storedtasks = JSON.parse(filemocks[tasksjsonpath])
    expect(storedtasks.tasks.length).toEqual(1)
    const firsttask = storedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask.data).toEqual(data)
    expect(firsttask.worker).toEqual(workername)
    expect(firsttask.status).toEqual("inprogress")
    expect(firsttask.startedat).toEqual(startedat)
  })

  it("should set the worker to idle when there is no matching task", async() => {
    const taskid = "TASK_ID"
    const workername = "TASK_WORKER"
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "ANOTHER_TASK_TYPE", status: "open", id: taskid }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    await request(app).post("/api/tasks/take/").send({
      type: "TYPE_TO_TEST",
      worker: workername
    })
    // Analyze workers
    const res = await request(app).get("/api/workers/list/").send()
    expect(res.statusCode).toEqual(200)
    const list = res.body
    const matchingworker = list.find((worker) => worker.name === workername)
    expect(matchingworker).toBeDefined()
    expect(matchingworker.name).toEqual(workername)
    expect(matchingworker.status).toEqual("idle")
  })

  it("should update the task processing information for the worker when matching task is found", async() => {
    const taskid = "TASK_ID"
    const workername = "TASK_WORKER"
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "open", id: taskid }
      ]
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    await request(app).post("/api/tasks/take/").send({
      type: "TYPE_TO_TEST",
      worker: workername
    })
    // Analyze workers
    const res = await request(app).get("/api/workers/list/").send()
    expect(res.statusCode).toEqual(200)
    const list = res.body
    const matchingworker = list.find((worker) => worker.name === workername)
    expect(matchingworker).toBeDefined()
    expect(matchingworker.name).toEqual(workername)
    expect(matchingworker.status).toEqual("working")
    expect(matchingworker.taskid).toEqual(taskid)
  })

})