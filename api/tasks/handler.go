package tasks

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"hilderonny/taskbridge/api/workers"
	"io"
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

/********** Konstanten **********/

var FILES_ROOT string
var TASKS_JSON_PATH string
var TASKS_JSON TasksJsonStruct

const (
	TASK_STATUS_COMPLETED  = "completed"
	TASK_STATUS_INPROGRESS = "inprogress"
	TASK_STATUS_OPEN       = "open"
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
}

func RespondWithJson(responseWriter http.ResponseWriter, dataToSend any) {
	responseWriter.Header().Add("Content-Type", "application/json")
	json.NewEncoder(responseWriter).Encode(dataToSend)
}

func SaveTasksJson(tasksJson TasksJsonStruct) {
	jsonContent, _ := json.MarshalIndent(tasksJson, "", "\t")
	os.WriteFile(TASKS_JSON_PATH, jsonContent, 0644)
}

/********** API - Funktionen **********/

func Add(responseWriter http.ResponseWriter, request *http.Request) {
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
	defer requestFile.Close()
	filePath := path.Join([]string{FILES_ROOT, newTask.File}...)
	os.MkdirAll(filepath.Dir(filePath), 0755)
	localFile, _ := os.Create(filePath)
	defer localFile.Close()
	io.Copy(localFile, requestFile)
	// Task speichern
	TASKS_JSON.Tasks = append(TASKS_JSON.Tasks, newTask)
	SaveTasksJson(TASKS_JSON)
	RespondWithJson(responseWriter, newTask)
}

func Complete(responseWriter http.ResponseWriter, request *http.Request) {
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

func Details(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	RespondWithJson(responseWriter, task)
}

func File(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	filePath := path.Join([]string{FILES_ROOT, task.File}...)
	responseWriter.Header().Set("Content-Disposition", "attachment; filename=\""+task.File+"\"")
	responseWriter.Header().Set("Content-Type", "application/octet-stream")
	http.ServeFile(responseWriter, request, filePath)
}

func List(responseWriter http.ResponseWriter, request *http.Request) {
	taskList := make([]TaskListStruct, len(TASKS_JSON.Tasks))
	for i := range TASKS_JSON.Tasks {
		taskList[i] = TASKS_JSON.Tasks[i].ForList()
	}
	RespondWithJson(responseWriter, taskList)
}

func Progress(responseWriter http.ResponseWriter, request *http.Request) {
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

func Remove(responseWriter http.ResponseWriter, request *http.Request) {
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

func Restart(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	task.Status = "open"
	SaveTasksJson(TASKS_JSON)
}

func Result(responseWriter http.ResponseWriter, request *http.Request) {
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

func Statistics(responseWriter http.ResponseWriter, request *http.Request) {
	RespondWithJson(responseWriter, TASKS_JSON.Statistics)
}

func Status(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	task := GetTaskById(taskId)
	if task == nil {
		responseWriter.WriteHeader(404)
		return
	}
	RespondWithJson(responseWriter, task.ForStatus())
}

func Take(responseWriter http.ResponseWriter, request *http.Request) {
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
		worker := workers.NotifyAboutWorkingWorker(takeRequest.Worker, takeRequest.Type, firstMatchingTask.Id)
		firstMatchingTask.WorkerName = worker.Name
		SaveTasksJson(TASKS_JSON)
		RespondWithJson(responseWriter, firstMatchingTask)
	} else {
		workers.NotifyAboutIdleWorker(takeRequest.Worker, takeRequest.Type)
		responseWriter.WriteHeader(404)
	}
}

func WorkerStatistics(responseWriter http.ResponseWriter, request *http.Request) {
	RespondWithJson(responseWriter, TASKS_JSON.WorkerStatistics)
}

/********** HTTP Handler **********/

func Register(filesRoot string, tasksJsonPath string) {
	FILES_ROOT = filesRoot
	TASKS_JSON_PATH = tasksJsonPath
	// Tasks laden
	LoadTasksJson()
	// API Routen registrieren
	http.HandleFunc("POST /api/tasks/add/", Add)
	http.HandleFunc("POST /api/tasks/complete/{taskid}/", Complete)
	http.HandleFunc("GET /api/tasks/details/{taskid}/", Details)
	http.HandleFunc("GET /api/tasks/file/{taskid}/", File)
	http.HandleFunc("GET /api/tasks/list/", List)
	http.HandleFunc("POST /api/tasks/progress/{taskid}/", Progress)
	http.HandleFunc("DELETE /api/tasks/remove/{taskid}/", Remove)
	http.HandleFunc("GET /api/tasks/restart/{taskid}/", Restart)
	http.HandleFunc("GET /api/tasks/result/{taskid}/", Result)
	http.HandleFunc("GET /api/tasks/statistics/", Statistics)
	http.HandleFunc("GET /api/tasks/status/{taskid}/", Status)
	http.HandleFunc("POST /api/tasks/take/", Take)
	http.HandleFunc("GET /api/tasks/workerstatistics/", WorkerStatistics)
}
