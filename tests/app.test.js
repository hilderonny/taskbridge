const request = require("supertest")

const createApp = require("../app.js")

describe("GET /apidoc/", () => {

    it("should return Swagger UI", async () => {
        const app = createApp("./testupload", "./testwebroot")
        const res = await request(app).get("/apidoc/").send()
        expect(res.statusCode).toEqual(200)
      })

      it("should ignore missing WEBROOT", async () => {
        const app = createApp("./testupload")
        const res = await request(app).get("/apidoc/").send()
        expect(res.statusCode).toEqual(200)
      })
        
})