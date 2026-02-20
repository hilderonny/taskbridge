package main

import (
	"fmt"
	"hilderonny/taskbridge/api/tasks"
	"hilderonny/taskbridge/api/version"
	"hilderonny/taskbridge/api/workers"
	"io"
	"log"
	"net/http"
)

var VERSION string = "2.0.0"

var FILES_ROOT string = "./data/files"
var TASKS_JSON_PATH string = "./data/tasks.json"

var WEB_ROOT string = "./html"

func main() {

	// API-Endpunkte
	tasks.Register(FILES_ROOT, TASKS_JSON_PATH)
	version.Register(VERSION)
	workers.Register()

	// Statische HTML Seiten ausliefern, wird reingemountet
	http.Handle("/", http.FileServer(http.Dir(WEB_ROOT)))

	// HTTPS-Server starten, geht in Endlosschleife
	server := &http.Server{
		Addr:     ":3000",
		Handler:  nil,
		ErrorLog: log.New(io.Discard, "", 0),
	}
	fmt.Println("Taskbridge running at port 3000")
	server.ListenAndServeTLS("server.crt", "server.key")
}
