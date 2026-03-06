package workers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

type WorkerStruct struct {
	Id         string
	LastPingAt time.Time
	Name       string
	Status     string
	TaskId     string
	Type       string
}

var WORKERS []WorkerStruct = []WorkerStruct{}

func List(responseWriter http.ResponseWriter, request *http.Request) {
	filteredWorkers := make([]map[string]string, len(WORKERS))
	for i, worker := range WORKERS {
		timeSinceLastPingInSeconds := time.Since(worker.LastPingAt)
		filteredWorker := make(map[string]string)
		filteredWorker["name"] = worker.Name
		filteredWorker["type"] = worker.Type
		filteredWorker["status"] = worker.Status
		filteredWorker["lastping"] = strconv.FormatInt(timeSinceLastPingInSeconds.Milliseconds(), 10)
		filteredWorkers[i] = filteredWorker
	}
	json.NewEncoder(responseWriter).Encode(filteredWorkers)
}

func Register() {
	http.HandleFunc("GET /api/workers/list", List)
}
