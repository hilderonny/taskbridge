package main

import (
	"fmt"
	"hilderonny/taskbridge/api/tasks"
	"hilderonny/taskbridge/api/workers"
	"io"
	"log"
	"net/http"
	"os"
)

var FILES_ROOT string = "./data/files"
var PORT string
var TASKS_JSON_PATH string = "./data/tasks.json"
var WEB_ROOT string = "./html"

func main() {

	// Portnummer aus Umgebungsvariable
	PORT = os.Getenv("PORT")
	if PORT == "" {
		fmt.Println("Environment variable PORT is missing!")
		return
	}

	// API-Endpunkte
	tasks.Register(FILES_ROOT, TASKS_JSON_PATH)
	workers.Register()

	// Statische HTML Seiten ausliefern, wird reingemountet
	http.Handle("/", http.FileServer(http.Dir(WEB_ROOT)))

	// HTTPS-Server starten, geht in Endlosschleife
	server := &http.Server{
		Addr:     ":" + PORT,
		Handler:  nil,
		ErrorLog: log.New(io.Discard, "", 0),
	}
	fmt.Println("Taskbridge running at port " + PORT)
	server.ListenAndServe()
}
