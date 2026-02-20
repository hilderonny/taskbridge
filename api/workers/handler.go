package workers

import (
	"net/http"
)

func List(responseWriter http.ResponseWriter, request *http.Request) {
}

func Register() {
	http.HandleFunc("GET /api/workers/list", List)
}
