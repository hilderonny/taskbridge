package version

import (
	"fmt"
	"net/http"
)

var VERSION string

func GetVersion(responseWriter http.ResponseWriter, request *http.Request) {
	fmt.Fprint(responseWriter, VERSION)
}

func Register(version string) {
	VERSION = version
	http.HandleFunc("GET /api/version", GetVersion)
}
