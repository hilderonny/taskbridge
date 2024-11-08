const request = require("supertest")

const app = require("../../app.js")("./testupload", "./testwebroot")
const { version } = require("../../package.json")

describe("GET /api/version/", () => {

  it("should return current version number", async () => {
    const res = await request(app).get("/api/version/").send()
    expect(res.statusCode).toEqual(200)
    expect(res.text).toEqual(version)
  })

})