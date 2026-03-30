import Cors from 'cors'
import Express from 'express'
import Fs from 'node:fs'
import Helper from './Helper.mjs'
import Http from 'http'
import Https from 'https'
import Multer from 'multer'
import Tasks from './api/Tasks.mjs'
import Workers from './api/Workers.mjs'

/********** Globale Variablen **********/

const PORT = process.env.PORT
const HTTPSPORT = process.env.HTTPSPORT
const PERSISTENCE = process.env.PERSISTENCE

/********** Konstanten **********/

const WEB_ROOT = "./html"
const UPLOAD = Multer({ dest: Helper.FILES_ROOT })

/********** Hauptprogramm **********/

// Umgebungsvariablen prüfen
if (!PORT) {
    console.error("Environment variable PORT is missing!")
    process.exit(1)
}
if (!HTTPSPORT) {
    console.error("Environment variable HTTPSPORT is missing!")
    process.exit(1)
}
if (PERSISTENCE !== Helper.PERSISTENCE_ONDISK && PERSISTENCE !== Helper.PERSISTENCE_INMEMORY) {
    console.error(`Environment variable PERSISTENCE is missing or not of '${Helper.PERSISTENCE_ONDISK}' or '${Helper.PERSISTENCE_INMEMORY}'!`)
    process.exit(1)
}

// Tasks laden
Helper.LoadTasksJson(PERSISTENCE)

// Server vorbereiten
const app = Express()
app.use(Cors())
app.use(Express.static(WEB_ROOT))

// APIs registrieren
app.post('/api/tasks/add/', UPLOAD.single('file'), Tasks.Add)
app.post('/api/tasks/complete/:taskId', Express.json({ limit: "50mb"}), Tasks.Complete)
app.get('/api/tasks/details/:taskId', Tasks.Details)
app.get('/api/tasks/file/:taskId', Tasks.File)
app.get('/api/tasks/list/', Tasks.List)
app.post('/api/tasks/progress/:taskId', Express.json({ limit: "50mb"}), Tasks.Progress)
app.delete('/api/tasks/remove/:taskId', Tasks.Remove)
app.get('/api/tasks/restart/:taskId', Tasks.Restart)
app.get('/api/tasks/result/:taskId', Tasks.Result)
app.get('/api/tasks/statistics/', Tasks.Statistics)
app.get('/api/tasks/status/:taskId', Tasks.Status)
app.post('/api/tasks/take/', Express.json(), Tasks.Take)
app.get('/api/tasks/workerstatistics/', Tasks.WorkerStatistics)
app.get('/api/workers/list/', Workers.List)

// Server starten
Http.createServer(app).listen(PORT, () => {
    console.log(`Taskbridge HTTP running at port ${PORT}`)
})
Https.createServer({
    key: Fs.readFileSync('./server.key'),
    cert: Fs.readFileSync('./server.crt'),
  }, app).listen(HTTPSPORT, () => {
    console.log(`Taskbridge HTTPS running at port ${HTTPSPORT}`)
})