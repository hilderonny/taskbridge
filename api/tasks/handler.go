package tasks

import (
	"encoding/json"
	"net/http"
	"os"
	"path"
	"strconv"
	"time"
)

type TaskStruct struct {
	Id          string
	Type        string
	File        string
	Status      string
	Progress    string
	CreatedAt   time.Time
	StartedAt   time.Time
	CompletedAt time.Time
	Worker      string
}

var FILES_ROOT string
var TASKS []TaskStruct = []TaskStruct{}

func Add(responseWriter http.ResponseWriter, request *http.Request) {
}

func Complete(responseWriter http.ResponseWriter, request *http.Request) {
}

func Cleanup() {
	directoryEntries, _ := os.ReadDir(FILES_ROOT)
	for _, directoryEntry := range directoryEntries {
		os.RemoveAll(path.Join([]string{FILES_ROOT, directoryEntry.Name()}...))
	}
}

func Details(responseWriter http.ResponseWriter, request *http.Request) {
}

func File(responseWriter http.ResponseWriter, request *http.Request) {
}

func List(responseWriter http.ResponseWriter, request *http.Request) {
	filteredTasks := make([]map[string]string, len(TASKS))
	for i, task := range TASKS {
		filteredTask := make(map[string]string)
		filteredTask["id"] = task.Id
		filteredTask["type"] = task.Type
		filteredTask["file"] = task.File
		filteredTask["status"] = task.Status
		filteredTask["progress"] = task.Progress
		filteredTask["createdat"] = strconv.FormatInt(task.CreatedAt.UnixNano(), 10)
		filteredTask["startedat"] = strconv.FormatInt(task.StartedAt.UnixNano(), 10)
		filteredTask["completedat"] = strconv.FormatInt(task.CompletedAt.UnixNano(), 10)
		filteredTask["worker"] = task.Worker
		filteredTasks[i] = filteredTask
	}
	json.NewEncoder(responseWriter).Encode(filteredTasks)
}

func Progress(responseWriter http.ResponseWriter, request *http.Request) {
}

func Remove(responseWriter http.ResponseWriter, request *http.Request) {
}

func Restart(responseWriter http.ResponseWriter, request *http.Request) {
}

func Result(responseWriter http.ResponseWriter, request *http.Request) {
}

func Statistics(responseWriter http.ResponseWriter, request *http.Request) {
}

func Status(responseWriter http.ResponseWriter, request *http.Request) {
}

func Take(responseWriter http.ResponseWriter, request *http.Request) {
}

func WorkerStatistics(responseWriter http.ResponseWriter, request *http.Request) {
}

func Register(filesRoot string) {
	FILES_ROOT = filesRoot
	// Dateiverzeichnis nach Neustart bereinigen, falls da altes Zeugs drin liegt
	Cleanup()
	// API Routen registrieren
	http.HandleFunc("POST /api/tasks/add", Add)
	http.HandleFunc("POST /api/tasks/complete/{taskid}", Complete)
	http.HandleFunc("GET /api/tasks/details/{taskid}", Details)
	http.HandleFunc("GET /api/tasks/file/{taskid}", File)
	http.HandleFunc("GET /api/tasks/list", List)
	http.HandleFunc("POST /api/tasks/progress/{taskid}", Progress)
	http.HandleFunc("DELETE /api/tasks/remove/{taskid}", Remove)
	http.HandleFunc("GET /api/tasks/restart/{taskid}", Restart)
	http.HandleFunc("GET /api/tasks/result/{taskid}", Result)
	http.HandleFunc("GET /api/tasks/statistics", Statistics)
	http.HandleFunc("GET /api/tasks/status/{taskid}", Status)
	http.HandleFunc("POST /api/tasks/take", Take)
	http.HandleFunc("GET /api/tasks/workerstatistics", WorkerStatistics)
}
