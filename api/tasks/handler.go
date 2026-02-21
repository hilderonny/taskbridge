package tasks

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"time"
)

/********** Strukturen **********/

type TasksJsonStruct struct {
	Tasks      []TaskStruct   `json:"tasks,omitempty"`
	Statistics map[string]int `json:"statistics,omitempty"`
}

type TaskListStruct struct {
	CompletedAt int64  `json:"completedat,omitempty"`
	CreatedAt   int64  `json:"createdat,omitempty"`
	File        string `json:"file,omitempty"`
	Id          string `json:"id,omitempty"`
	Progress    int    `json:"progress,omitempty"`
	StartedAt   int64  `json:"startedat,omitempty"`
	Status      string `json:"status,omitempty"`
	Type        string `json:"type,omitempty"`
	Worker      string `json:"worker,omitempty"`
}

type TaskStruct struct {
	CompletedAt  int64          `json:"completedat,omitempty"`
	CreatedAt    int64          `json:"createdat,omitempty"`
	Data         map[string]any `json:"data,omitempty"`
	File         string         `json:"file,omitempty"`
	Id           string         `json:"id,omitempty"`
	Progress     int            `json:"progress,omitempty"`
	Requirements map[string]any `json:"requirements,omitempty"`
	Result       map[string]any `json:"result,omitempty"`
	StartedAt    int64          `json:"startedat,omitempty"`
	Status       string         `json:"status,omitempty"`
	Type         string         `json:"type,omitempty"`
	Worker       string         `json:"worker,omitempty"`
}

/********** Konstanten **********/

var FILES_ROOT string
var TASKS_JSON_PATH string
var TASKS_JSON TasksJsonStruct

/********** Hilfsfunktionen **********/

func Cleanup() {
	directoryEntries, _ := os.ReadDir(FILES_ROOT)
	for _, directoryEntry := range directoryEntries {
		os.RemoveAll(path.Join([]string{FILES_ROOT, directoryEntry.Name()}...))
	}
}

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
		Worker:      task.Worker,
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

func LoadTasksJson() {
	if _, err := os.Stat(TASKS_JSON_PATH); errors.Is(err, os.ErrNotExist) {
		os.MkdirAll(filepath.Dir(TASKS_JSON_PATH), 0755)
		TASKS_JSON = TasksJsonStruct{}
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
}

func List(responseWriter http.ResponseWriter, request *http.Request) {
	taskList := make([]TaskListStruct, len(TASKS_JSON.Tasks))
	for i := range TASKS_JSON.Tasks {
		taskList[i] = TASKS_JSON.Tasks[i].ForList()
	}
	RespondWithJson(responseWriter, taskList)
}

func Progress(responseWriter http.ResponseWriter, request *http.Request) {
}

func Remove(responseWriter http.ResponseWriter, request *http.Request) {
	taskId := request.PathValue("taskid")
	for index, task := range TASKS_JSON.Tasks {
		if task.Id == taskId {
			TASKS_JSON.Tasks = append(TASKS_JSON.Tasks[:index], TASKS_JSON.Tasks[index+1:]...)
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
}

func Statistics(responseWriter http.ResponseWriter, request *http.Request) {
	RespondWithJson(responseWriter, TASKS_JSON.Statistics)
}

func Status(responseWriter http.ResponseWriter, request *http.Request) {
}

func Take(responseWriter http.ResponseWriter, request *http.Request) {
}

func WorkerStatistics(responseWriter http.ResponseWriter, request *http.Request) {
}

/********** HTTP Handler **********/

func Register(filesRoot string, tasksJsonPath string) {
	FILES_ROOT = filesRoot
	TASKS_JSON_PATH = tasksJsonPath
	// Dateiverzeichnis nach Neustart bereinigen, falls da altes Zeugs drin liegt
	Cleanup()
	// Tasks laden
	LoadTasksJson()
	// API Routen registrieren
	http.HandleFunc("POST /api/tasks/add/", Add)
	http.HandleFunc("POST /api/tasks/complete/{taskid}", Complete)
	http.HandleFunc("GET /api/tasks/details/{taskid}", Details)
	http.HandleFunc("GET /api/tasks/file/{taskid}", File)
	http.HandleFunc("GET /api/tasks/list/", List)
	http.HandleFunc("POST /api/tasks/progress/{taskid}", Progress)
	http.HandleFunc("DELETE /api/tasks/remove/{taskid}", Remove)
	http.HandleFunc("GET /api/tasks/restart/{taskid}", Restart)
	http.HandleFunc("GET /api/tasks/result/{taskid}", Result)
	http.HandleFunc("GET /api/tasks/statistics/", Statistics)
	http.HandleFunc("GET /api/tasks/status/{taskid}", Status)
	http.HandleFunc("POST /api/tasks/take", Take)
	http.HandleFunc("GET /api/tasks/workerstatistics", WorkerStatistics)
}
