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

describe("POST /api/tasks/complete/", () => {

  it("should return 404 when there is no task with the given id", async() => {
    const taskid = "TASK_ID"
    const result = { this: { is: "my result" } }
    // Prepare empty tasks file
    filemocks[tasksjsonpath] = '{"tasks":[]}'
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post(`/api/tasks/complete/${taskid}`).send({
      result: result
    })
    // Analyze response
    expect(res.statusCode).toEqual(404)
  })

  it("should return 200 when a task with the given id was found", async() => {
    const taskid = "TASK_ID"
    const result = { this: { is: "my result" } }
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "inprogress", id: taskid }
      ],
      statistics: {}
    })
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    const res = await request(app).post(`/api/tasks/complete/${taskid}`).send({
      result: result
    })
    // Analyze response
    expect(res.statusCode).toEqual(200)
  })

  it("should save the task on disk including result, completedat and updated status", async() => {
    const taskid = "TASK_ID"
    const result = { this: { is: "my result" } }
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: "TYPE_TO_TEST", status: "inprogress", id: taskid }
      ],
      statistics: {}
    })
    // Mock completion date
    const completedat = new Date('2024-11-07T02:00:00.000Z').valueOf()
    jest.spyOn(global.Date, "now").mockImplementation(() => completedat)
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    await request(app).post(`/api/tasks/complete/${taskid}`).send({
      result: result
    })
    // Analyze stored tasks
    const storedtasks = JSON.parse(filemocks[tasksjsonpath])
    expect(storedtasks.tasks.length).toEqual(1)
    const firsttask = storedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask.result).toEqual(result)
    expect(firsttask.completedat).toEqual(completedat)
    expect(firsttask.status).toEqual("completed")
  })

  it("should update existing task statistics for the task type", async() => {
    const taskid = "TASK_ID"
    const tasktype = "TYPE_TO_TEST"
    const result = { this: { is: "my result" } }
    const count = 13
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: tasktype, status: "inprogress", id: taskid }
      ],
      statistics: {
        "TYPE_TO_TEST": count
      }
    })
    // Mock completion date
    const completedat = new Date('2024-11-07T02:00:00.000Z').valueOf()
    jest.spyOn(global.Date, "now").mockImplementation(() => completedat)
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    await request(app).post(`/api/tasks/complete/${taskid}`).send({
      result: result
    })
    // Analyze statistics
    const storedtasks = JSON.parse(filemocks[tasksjsonpath])
    expect(storedtasks.statistics).toHaveProperty(tasktype)
    expect(storedtasks.statistics[tasktype]).toEqual(count + 1)
  })

  it("should create task statistics for the task type when missing", async() => {
    const taskid = "TASK_ID"
    const tasktype = "TYPE_TO_TEST"
    const result = { this: { is: "my result" } }
    // Prepare tasks file
    filemocks[tasksjsonpath] = JSON.stringify({
      tasks: [
        { type: tasktype, status: "inprogress", id: taskid }
      ],
      statistics: {}
    })
    // Mock completion date
    const completedat = new Date('2024-11-07T02:00:00.000Z').valueOf()
    jest.spyOn(global.Date, "now").mockImplementation(() => completedat)
    // Create app
    app = createApp("./testupload", "./testwebroot")
    // Call API
    await request(app).post(`/api/tasks/complete/${taskid}`).send({
      result: result
    })
    // Analyze statistics
    const storedtasks = JSON.parse(filemocks[tasksjsonpath])
    expect(storedtasks.statistics).toHaveProperty(tasktype)
    expect(storedtasks.statistics[tasktype]).toEqual(1)
  })

})