package main

import (
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/ksankeerth/open-image-registry/db"
	"github.com/ksankeerth/open-image-registry/routes"
)

func main() {
	fmt.Println("Starting Docker Registry .....")

	webappBuildPath := flag.String("webapp-build-path", "./../webapp/build", "Path to the built web app")
	flag.Parse()

	fmt.Println("Webapp build path:", *webappBuildPath)

	database, err := db.InitDB()
	if err != nil {
		log.Fatalf("Server startup failed due to db errors")
		return
	}

	router := routes.InitRouter(*webappBuildPath, database)

	address := fmt.Sprintf(":%d", 8000)

	server := &http.Server{
		Addr:    address,
		Handler: router,
	}

	go func(server *http.Server) {
		fmt.Printf("Server is listening on port: %d\n", 8000)
		err := server.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			fmt.Printf("Server stopped due to errors: %v \n", err)
		}
	}(server)

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	<-shutdown

	fmt.Println("Server is about to shoutdown.")
}