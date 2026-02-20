package tasks

import (
	"net/http"
)

var FILES_ROOT string

func Add(responseWriter http.ResponseWriter, request *http.Request) {
}

func Complete(responseWriter http.ResponseWriter, request *http.Request) {
}

func Details(responseWriter http.ResponseWriter, request *http.Request) {
}

func File(responseWriter http.ResponseWriter, request *http.Request) {
}

func List(responseWriter http.ResponseWriter, request *http.Request) {
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
