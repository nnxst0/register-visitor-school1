package main

import (
	"log"
	"net/http"
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/repository"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	cfg := config.Load()
	log.Printf("Starting server on %s:%s", cfg.Server.Host, cfg.Server.Port)

	db, err := database.NewDatabase(database.Config{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	visitorRepo := repository.NewVisitorRepository(db.DB)
	exportRepo := repository.NewExportRepository(db.DB)

	visitorHandler := handlers.NewVisitorHandler(visitorRepo)
	exportHandler := handlers.NewExportHandler(visitorRepo, exportRepo)

	router := mux.NewRouter()
	api := router.PathPrefix("/api").Subrouter()

	api.HandleFunc("/visitors/return-history", visitorHandler.GetReturnHistory).Methods("GET")
	api.HandleFunc("/visitors/rfid/{cardId}", visitorHandler.SearchByRFID).Methods("GET")
	api.HandleFunc("/visitors/return/{cardId}", visitorHandler.ReturnCard).Methods("POST")
	api.HandleFunc("/visitors/export", visitorHandler.GetVisitors).Methods("GET") // ⭐ เพิ่มบรรทัดนี้

	api.HandleFunc("/visitors", visitorHandler.CreateVisitor).Methods("POST")
	api.HandleFunc("/visitors", visitorHandler.ListVisitors).Methods("GET")
	api.HandleFunc("/visitors/{id}", visitorHandler.GetVisitor).Methods("GET")

	api.HandleFunc("/export-history", exportHandler.GetExportHistory).Methods("GET")
	api.HandleFunc("/export-history", exportHandler.CreateExportHistory).Methods("POST")

	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok", "timestamp": "` + time.Now().Format(time.RFC3339) + `"}`))
	}).Methods("GET")

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	handler := corsHandler.Handler(router)
	server := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Server is running on http://%s:%s", cfg.Server.Host, cfg.Server.Port)
	log.Printf("  - POST   /api/visitors")
	log.Printf("  - GET    /api/visitors")
	log.Printf("  - GET    /api/visitors/{id}")
	log.Printf("  - GET    /api/visitors/export ✨") // ⭐ เพิ่มบรรทัดนี้
	log.Printf("  - GET    /api/visitors/return-history")
	log.Printf("  - GET    /api/visitors/rfid/{cardId}")
	log.Printf("  - POST   /api/visitors/return/{cardId}")
	log.Printf("  - GET    /api/export-history ✨") // ⭐ เพิ่มบรรทัดนี้
	log.Printf("  - POST   /api/export-history ✨") // ⭐ เพิ่มบรรทัดนี้

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start server: %v", err)
	}
}
