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