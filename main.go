// Version: 2.0.0

package main

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"time"
)

/********** Strukturen **********/

type CompleteRequest struct {
	Result map[string]any `json:"result"`
}

type ProgressRequest struct {
	Progress string `json:"progress"`
}

type TakeRequest struct {
	Type   string `json:"type"`
	Worker string `json:"worker"`
}

type TasksJsonStruct struct {
	Tasks            []TaskStruct              `json:"tasks"`
	Statistics       map[string]int            `json:"statistics"`
	WorkerStatistics map[string]map[string]int `json:"workerstatistics"`
}

type TaskListStruct struct {
	CompletedAt int64  `json:"completedat,omitempty"`
	CreatedAt   int64  `json:"createdat"`
	File        string `json:"file,omitempty"`
	Id          string `json:"id"`
	Progress    int    `json:"progress,omitempty"`
	StartedAt   int64  `json:"startedat,omitempty"`
	Status      string `json:"status"`
	Type        string `json:"type"`
	WorkerName  string `json:"worker,omitempty"`
}

type TaskStatusStruct struct {
	Progress int    `json:"progress"`
	Status   string `json:"status"`
}

type TaskStruct struct {
	CompletedAt  int64          `json:"completedat,omitempty"`
	CreatedAt    int64          `json:"createdat"`
	Data         map[string]any `json:"data,omitempty"`
	File         string         `json:"file,omitempty"`
	Id           string         `json:"id"`
	Progress     int            `json:"progress,omitempty"`
	Requirements map[string]any `json:"requirements,omitempty"`
	Result       map[string]any `json:"result,omitempty"`
	StartedAt    int64          `json:"startedat,omitempty"`
	Status       string         `json:"status"`
	Type         string         `json:"type"`
	WorkerName   string         `json:"worker,omitempty"`
}

type WorkerStruct struct {
	LastPingAt time.Time
	Name       string
	Status     string
	TaskId     string
	Type       string
}

/********** Globale Variablen **********/

var (
	HTTPSPORT   string
	PERSISTENCE string
	PORT        string
	TASKS_JSON  TasksJsonStruct
	WORKERS     []WorkerStruct = []WorkerStruct{}
)

/********** Konstanten **********/

const (
	FILES_ROOT             = "./data/files"
	PERSISTENCE_ONDISK     = "ONDISK"
	PERSISTENCE_INMEMORY   = "INMEMORY"
	TASK_STATUS_COMPLETED  = "completed"
	TASK_STATUS_INPROGRESS = "inprogress"
	TASK_STATUS_OPEN       = "open"
	TASKS_JSON_PATH        = "./data/tasks.json"
	WEB_ROOT               = "./html"
	WORKER_STATUS_IDLE     = "idle"
	WORKER_STATUS_WORKING  = "working"
)

/********** Hilfsfunktionen **********/

func (task TaskStruct) ForList() TaskListStruct {
	return TaskListStruct{
		CompletedAt: task.CompletedAt,
		CreatedAt:   task.CreatedAt,
		File:        task.File,
		Id:          task.Id,
		Progress:    task.Progress,
		StartedAt:   task.StartedAt,
		Status:      task.Status,
		Type:        task.Type,
		WorkerName:  task.WorkerName,
	}
}

func (task TaskStruct) ForStatus() TaskStatusStruct {
	return TaskStatusStruct{
		Progress: task.Progress,
		Status:   task.Status,
	}
}

func GetTaskById(taskId string) *TaskStruct {
	for i := range TASKS_JSON.Tasks {
		if TASKS_JSON.Tasks[i].Id == taskId {
			return &TASKS_JSON.Tasks[i]
		}
	}
	return nil
}

func GetWorkerByNameAndTypeOrCreateIt(workerName string, workerType string) *WorkerStruct {
	var workerReference *WorkerStruct
	for i := range WORKERS {
		worker := &WORKERS[i]
		if worker.Name == workerName {
			workerReference = worker
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

func IncrementTaskTypeStatistic(taskType string) {
	TASKS_JSON.Statistics[taskType]++
}

func IncrementWorkerStatistic(workerName string, taskType string) {
	if TASKS_JSON.WorkerStatistics[workerName] == nil {
		TASKS_JSON.WorkerStatistics[workerName] = make(map[string]int)
	}
	TASKS_JSON.WorkerStatistics[workerName][taskType]++
}

func LoadTasksJson() {
	if PERSISTENCE == PERSISTENCE_ONDISK {
		if _, err := os.Stat(TASKS_JSON_PATH); errors.Is(err, os.ErrNotExist) {
			os.MkdirAll(filepath.Dir(TASKS_JSON_PATH), 0755)
			TASKS_JSON = TasksJsonStruct{
				Tasks:            []TaskStruct{},
				Statistics:       map[string]int{},
				WorkerStatistics: map[string]map[string]int{},
			}
			SaveTasksJson(TASKS_JSON)
		} else {
			fileContent, _ := os.ReadFile(TASKS_JSON_PATH)
			json.Unmarshal(fileContent, &TASKS_JSON)
		}
	} else {
		TASKS_JSON = TasksJsonStruct{
			Tasks:            []TaskStruct{},
			Statistics:       map[string]int{},
			WorkerStatistics: map[string]map[string]int{},
		}
	}
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

func RespondWithJson(responseWriter http.ResponseWriter, dataToSend any) {
	responseWriter.Header().Add("Content-Type", "application/json")
	json.NewEncoder(responseWriter).Encode(dataToSend)
}

func SaveTasksJson(tasksJson TasksJsonStruct) {
	if PERSISTENCE == PERSISTENCE_ONDISK {
		jsonContent, _ := json.MarshalIndent(tasksJson, "", "\t")
		os.WriteFile(TASKS_JSON_PATH, jsonContent, 0644)
	}
}

// Globale CORS-Middleware für alle Routen
func WithCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Für Entwicklung erstmal alles erlauben
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Type")

		// Preflight-Requests direkt beantworten
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

/********** API - Funktionen **********/

func Api_Tasks_Add(responseWriter http.ResponseWriter, request *http.Request) {
	request.ParseMultipartForm(32 << 20)
	// JSON Daten
	jsonData := request.FormValue("json")
	newTask := TaskStruct{
		CreatedAt: time.Now().UTC().UnixMilli(),
		Id:        rand.Text(),
		Status:    "open",
	}
	newTask.File = newTask.Id // Filename is the same as the Id
	json.Unmarshal([]byte(jsonData), &newTask)
	// Datei speichern
	requestFile, _, _ := request.FormFile("file")
	if requestFile != nil {
		defer requestFile.Close()
		filePath := path.Join([]string{FILES_ROOT, newTask.File}...)
		os.MkdirAll(filepath.Dir(filePath), 0755)
		localFile, _ := os.Create(filePath)
		defer localFile.Close()
		io.Copy(localFile, requestFile)
	}
	// Task speichern
	TASKS_JSON.Tasks = append(TASKS_JSON.Tasks, newTask)
	SaveTasksJson(TASKS_JSON)
	RespondWithJson(responseWriter, newTask)
}

func Api_Tasks_Complete(responseWriter http.ResponseWriter, request *http.Request) {
	var completeRequest CompleteRequest
	err := json.NewDecoder(request.Body).Decode(&completeRequest)
	if err != nil {
		responseWriter.WriteHeader(400)
		return
	}
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	task.Result = completeRequest.Result
	task.CompletedAt = time.Now().UTC().UnixMilli()
	task.Status = TASK_STATUS_COMPLETED
	IncrementTaskTypeStatistic(task.Type)
	IncrementWorkerStatistic(task.WorkerName, task.Type)
	SaveTasksJson(TASKS_JSON)
}

func Api_Tasks_Details(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	RespondWithJson(responseWriter, task)
}

func Api_Tasks_File(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	filePath := path.Join([]string{FILES_ROOT, task.File}...)
	responseWriter.Header().Set("Content-Disposition", "attachment; filename=\""+task.File+"\"")
	responseWriter.Header().Set("Content-Type", "application/octet-stream")
	http.ServeFile(responseWriter, request, filePath)
}

func Api_Tasks_List(responseWriter http.ResponseWriter, request *http.Request) {
	taskList := make([]TaskListStruct, len(TASKS_JSON.Tasks))
	for i := range TASKS_JSON.Tasks {
		taskList[i] = TASKS_JSON.Tasks[i].ForList()
	}
	RespondWithJson(responseWriter, taskList)
}

func Api_Tasks_Progress(responseWriter http.ResponseWriter, request *http.Request) {
	var progressRequest ProgressRequest
	err := json.NewDecoder(request.Body).Decode(&progressRequest)
	if err != nil {
		responseWriter.WriteHeader(400)
		return
	}
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	task.Progress, _ = strconv.Atoi(progressRequest.Progress)
	SaveTasksJson(TASKS_JSON)
	responseWriter.WriteHeader(200)
}

func Api_Tasks_Remove(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	for index, task := range TASKS_JSON.Tasks {
		if task.Id == taskId {
			filePath := path.Join([]string{FILES_ROOT, task.File}...)
			os.RemoveAll(filePath)
			TASKS_JSON.Tasks = append(TASKS_JSON.Tasks[:index], TASKS_JSON.Tasks[index+1:]...)
			SaveTasksJson(TASKS_JSON)
			return
		}
	}
	responseWriter.WriteHeader(404)
}

func Api_Tasks_Restart(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	task.Status = "open"
	SaveTasksJson(TASKS_JSON)
}

func Api_Tasks_Result(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	result := make(map[string]map[string]any)
	result["result"] = task.Result
	RespondWithJson(responseWriter, result)
}

func Api_Tasks_Statistics(responseWriter http.ResponseWriter, request *http.Request) {
	RespondWithJson(responseWriter, TASKS_JSON.Statistics)
}

func Api_Tasks_Status(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	RespondWithJson(responseWriter, task.ForStatus())
}

func Api_Tasks_Take(responseWriter http.ResponseWriter, request *http.Request) {
	var takeRequest TakeRequest
	err := json.NewDecoder(request.Body).Decode(&takeRequest)
	if err != nil {
		responseWriter.WriteHeader(400)
		return
	}
	var firstMatchingTask *TaskStruct
	for i := range TASKS_JSON.Tasks {
		task := &TASKS_JSON.Tasks[i]
		if task.Type == takeRequest.Type && task.Status == TASK_STATUS_OPEN {
			firstMatchingTask = task
			break
		}
	}
	if firstMatchingTask != nil {
		firstMatchingTask.Status = TASK_STATUS_INPROGRESS
		worker := NotifyAboutWorkingWorker(takeRequest.Worker, takeRequest.Type, firstMatchingTask.Id)
		firstMatchingTask.WorkerName = worker.Name
		SaveTasksJson(TASKS_JSON)
		RespondWithJson(responseWriter, firstMatchingTask)
	} else {
		NotifyAboutIdleWorker(takeRequest.Worker, takeRequest.Type)
		responseWriter.WriteHeader(404)
	}
}

func Api_Tasks_WorkerStatistics(responseWriter http.ResponseWriter, request *http.Request) {
	RespondWithJson(responseWriter, TASKS_JSON.WorkerStatistics)
}

func Api_Workers_List(responseWriter http.ResponseWriter, request *http.Request) {
	filteredWorkers := make([]map[string]string, len(WORKERS))
	for i, worker := range WORKERS {
		timeSinceLastPingInSeconds := time.Since(worker.LastPingAt)
		filteredWorker := make(map[string]string)
		filteredWorker["lastping"] = strconv.FormatInt(timeSinceLastPingInSeconds.Milliseconds(), 10)
		filteredWorker["name"] = worker.Name
		filteredWorker["type"] = worker.Type
		filteredWorker["status"] = worker.Status
		filteredWorker["taskid"] = worker.TaskId
		filteredWorkers[i] = filteredWorker
	}
	json.NewEncoder(responseWriter).Encode(filteredWorkers)
}

/********** Hauptprogramm **********/

func main() {

	// Portnummer aus Umgebungsvariable
	PORT = os.Getenv("PORT")
	if PORT == "" {
		fmt.Println("Environment variable PORT is missing!")
		return
	}
	HTTPSPORT = os.Getenv("HTTPSPORT")
	if HTTPSPORT == "" {
		fmt.Println("Environment variable HTTPSPORT is missing!")
		return
	}
	// Persistenz in Datei noder in Speicher
	PERSISTENCE = os.Getenv("PERSISTENCE")
	if PERSISTENCE != PERSISTENCE_ONDISK && PERSISTENCE != PERSISTENCE_INMEMORY {
		fmt.Println("Environment variable PERSISTENCE is missing or not of 'ONDISK' or 'INMEMORY'!")
		return
	}

	// Tasks laden
	LoadTasksJson()
	// API Routen registrieren
	http.HandleFunc("POST /api/tasks/add/", Api_Tasks_Add)
	http.HandleFunc("POST /api/tasks/complete/{taskid}/", Api_Tasks_Complete)
	http.HandleFunc("GET /api/tasks/details/{taskid}/", Api_Tasks_Details)
	http.HandleFunc("GET /api/tasks/file/{taskid}/", Api_Tasks_File)
	http.HandleFunc("GET /api/tasks/list/", Api_Tasks_List)
	http.HandleFunc("POST /api/tasks/progress/{taskid}/", Api_Tasks_Progress)
	http.HandleFunc("DELETE /api/tasks/remove/{taskid}/", Api_Tasks_Remove)
	http.HandleFunc("GET /api/tasks/restart/{taskid}/", Api_Tasks_Restart)
	http.HandleFunc("GET /api/tasks/result/{taskid}/", Api_Tasks_Result)
	http.HandleFunc("GET /api/tasks/statistics/", Api_Tasks_Statistics)
	http.HandleFunc("GET /api/tasks/status/{taskid}/", Api_Tasks_Status)
	http.HandleFunc("POST /api/tasks/take/", Api_Tasks_Take)
	http.HandleFunc("GET /api/tasks/workerstatistics/", Api_Tasks_WorkerStatistics)
	http.HandleFunc("GET /api/workers/list/", Api_Workers_List)

	// Statische HTML Seiten ausliefern, wird reingemountet
	http.Handle("/", http.FileServer(http.Dir(WEB_ROOT)))

	// Gesamten DefaultMux mit CORS wrappen
	handler := WithCORS(http.DefaultServeMux)

	// Server für HTTP und HTTPS vorbereiten
	httpServer := &http.Server{
		Addr:     ":" + PORT,
		Handler:  handler,
		ErrorLog: log.New(io.Discard, "", 0),
	}
	httpsServer := &http.Server{
		Addr:     ":" + HTTPSPORT,
		Handler:  handler,
		ErrorLog: log.New(io.Discard, "", 0),
	}

	// HTTP-Server in paralellelm thread starten
	go func() {
		fmt.Println("Taskbridge HTTP running at port " + PORT)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP-Server Fehler: %v", err)
		}
	}()

	// HTTPS-Server starten, geht in Endlosschleife
	httpsServer.ListenAndServeTLS("server.crt", "server.key")
	if err := httpsServer.ListenAndServeTLS("server.crt", "server.key"); err != nil && err != http.ErrServerClosed {
		log.Fatalf("HTTPS-Server Fehler: %v", err)
	}
}
