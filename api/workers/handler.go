package workers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

type WorkerStruct struct {
	LastPingAt time.Time
	Name       string
	Status     string
	TaskId     string
	Type       string
}

var WORKERS []WorkerStruct = []WorkerStruct{}

const (
	WORKER_STATUS_IDLE    = "idle"
	WORKER_STATUS_WORKING = "working"
)

func GetWorkerByNameAndTypeOrCreateIt(workerName string, workerType string) *WorkerStruct {
	var workerReference *WorkerStruct
	for _, worker := range WORKERS {
		if worker.Name == workerName {
			workerReference = &worker
			break
		}
	}
	if workerReference == nil {
		workerReference = &WorkerStruct{
			Name: workerName,
			Type: workerType,
		}
		WORKERS = append(WORKERS, *workerReference)
	}
	return workerReference
}

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

func NotifyAboutIdleWorker(workerName string, workerType string) {
	worker := GetWorkerByNameAndTypeOrCreateIt(workerName, workerType)
	worker.LastPingAt = time.Now()
	worker.Status = WORKER_STATUS_IDLE
}

func NotifyAboutWorkingWorker(workerName string, workerType string, taskId string) *WorkerStruct {
	worker := GetWorkerByNameAndTypeOrCreateIt(workerName, workerType)
	worker.LastPingAt = time.Now()
	worker.Status = WORKER_STATUS_WORKING
	worker.TaskId = taskId
	return worker
}

func Register() {
	http.HandleFunc("GET /api/workers/list/", List)
}
