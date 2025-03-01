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
const crypto = require("crypto")

const createApp = require("../../../app.js")
const uploadpath = "./testupload"
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
  // Create app
  app = createApp(uploadpath, "./testwebroot")
})

afterEach(() => {
  // Clear all mocks
  jest.restoreAllMocks()
})

afterAll(() => {
  // Clean upload directory AFTER! all parallel tests
  for (const file of fs.readdirSync(uploadpath)) {
    fs.unlinkSync(path.join(uploadpath, file))
  }
})

function readtasksjson() {
  const filecontent = fs.readFileSync(tasksjsonpath, "utf8")
  return JSON.parse(filecontent)
}

describe("POST /api/tasks/add/", () => {

  it("should create and save a task in JSON file and return its generated id", async() => {
    // Mock UUID
    const taskid = "TEST_TASK_ID"
    jest.spyOn(crypto, "randomUUID").mockImplementationOnce(() => taskid)
    const tasktoadd = {
      type: "TEST_TYPE"
    }
    const res = await request(app)
      .post("/api/tasks/add/")
      .field("json", JSON.stringify(tasktoadd))
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("id")
    expect(res.body.id).toEqual(taskid)
    const savedtasks = readtasksjson()
    expect(savedtasks.tasks.length).toEqual(1)
    const firsttask = savedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
  })

  it("should save an attached file and link it", async() => {
    // Mock UUID
    const taskid = "TEST_TASK_ID_WITH_FILE"
    const testfilebuffer = Buffer.from("TEST_FILE_CONTENT")
    jest.spyOn(crypto, "randomUUID").mockImplementationOnce(() => taskid)
    const tasktoadd = {
      type: "TEST_TYPE_WITH_FILE"
    }
    const res = await request(app)
      .post("/api/tasks/add/")
      .field("json", JSON.stringify(tasktoadd))
      .attach("file", testfilebuffer, "TEST_FILE_NAME")
    expect(res.statusCode).toEqual(200)
    const savedtasks = readtasksjson()
    expect(savedtasks.tasks.length).toEqual(1)
    const firsttask = savedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask).toHaveProperty("file")
    const filename = firsttask.file
    const filepath = path.join(uploadpath, filename)
    // Clear file mocks before reading real file
    jest.restoreAllMocks()
    expect(fs.existsSync(filepath)).toEqual(true)
    const filecontentbuffer = fs.readFileSync(filepath)
    expect(filecontentbuffer).toEqual(testfilebuffer)
  })

  it("should set the status to 'open'", async() => {
    // Mock UUID
    const taskid = "TEST_TASK_ID"
    jest.spyOn(crypto, "randomUUID").mockImplementationOnce(() => taskid)
    const tasktoadd = {
      type: "TEST_TYPE"
    }
    const res = await request(app)
      .post("/api/tasks/add/")
      .field("json", JSON.stringify(tasktoadd))
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("id")
    expect(res.body.id).toEqual(taskid)
    const savedtasks = readtasksjson()
    expect(savedtasks.tasks.length).toEqual(1)
    const firsttask = savedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask.status).toEqual("open")
  })

  it("should store the creation time and given type", async() => {
    // Mock UUID
    const taskid = "TEST_TASK_ID"
    jest.spyOn(crypto, "randomUUID").mockImplementationOnce(() => taskid)
    // Mock creation date
    const createdat = new Date('2024-11-07T02:00:00.000Z').valueOf()
    jest.spyOn(global.Date, "now").mockImplementationOnce(() => createdat)
    const tasktoadd = {
      type: "TEST_TYPE"
    }
    const res = await request(app)
      .post("/api/tasks/add/")
      .field("json", JSON.stringify(tasktoadd))
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("id")
    expect(res.body.id).toEqual(taskid)
    const savedtasks = readtasksjson()
    expect(savedtasks.tasks.length).toEqual(1)
    const firsttask = savedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask.createdat).toEqual(createdat)
  })

  it("should store given data", async() => {
    // Mock UUID
    const taskid = "TEST_TASK_ID"
    jest.spyOn(crypto, "randomUUID").mockImplementationOnce(() => taskid)
    const tasktoadd = {
      type: "TEST_TYPE",
      data: { this: { is: "any data" } }
    }
    const res = await request(app)
      .post("/api/tasks/add/")
      .field("json", JSON.stringify(tasktoadd))
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("id")
    expect(res.body.id).toEqual(taskid)
    const savedtasks = readtasksjson()
    expect(savedtasks.tasks.length).toEqual(1)
    const firsttask = savedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask).toHaveProperty("data")
    expect(firsttask.data).toEqual(tasktoadd.data)
  })

  it("should store given requirements", async() => {
    // Mock UUID
    const taskid = "TEST_TASK_ID"
    jest.spyOn(crypto, "randomUUID").mockImplementationOnce(() => taskid)
    const tasktoadd = {
      type: "TEST_TYPE",
      requirements: { this: { is: "any requirement" } }
    }
    const res = await request(app)
      .post("/api/tasks/add/")
      .field("json", JSON.stringify(tasktoadd))
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty("id")
    expect(res.body.id).toEqual(taskid)
    const savedtasks = readtasksjson()
    expect(savedtasks.tasks.length).toEqual(1)
    const firsttask = savedtasks.tasks[0]
    expect(firsttask.id).toEqual(taskid)
    expect(firsttask).toHaveProperty("requirements")
    expect(firsttask.requirements).toEqual(tasktoadd.requirements)
  })

})