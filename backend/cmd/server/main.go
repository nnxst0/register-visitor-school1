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
	// Load configuration
	cfg := config.Load()
	log.Printf("Starting server on %s:%s", cfg.Server.Host, cfg.Server.Port)

	// Connect to database
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

	// Initialize repositories ⭐ เพิ่มบรรทัดนี้
	visitorRepo := repository.NewVisitorRepository(db.DB)
	exportRepo := repository.NewExportRepository(db.DB) // ⭐ เพิ่มบรรทัดนี้

	// Initialize handlers ⭐ แก้ไขบรรทัดนี้
	visitorHandler := handlers.NewVisitorHandler(visitorRepo)
	exportHandler := handlers.NewExportHandler(visitorRepo, exportRepo) // ⭐ เพิ่มบรรทัดนี้

	// Setup router
	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Visitor routes (เดิม)
	api.HandleFunc("/visitors", visitorHandler.CreateVisitor).Methods("POST")
	api.HandleFunc("/visitors", visitorHandler.ListVisitors).Methods("GET")
	api.HandleFunc("/visitors/{id}", visitorHandler.GetVisitor).Methods("GET")

	// Export routes ⭐ เพิ่มทั้ง 2 บรรทัดนี้
	api.HandleFunc("/export-history", exportHandler.GetExportHistory).Methods("GET")
	api.HandleFunc("/export-history", exportHandler.CreateExportHistory).Methods("POST")

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok", "timestamp": "` + time.Now().Format(time.RFC3339) + `"}`))
	}).Methods("GET")

	// CORS middleware
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200", "http://localhost:8080"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	// Start server
	handler := corsHandler.Handler(router)
	server := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Server is running on http://%s:%s", cfg.Server.Host, cfg.Server.Port)
	log.Printf("Health check: http://%s:%s/health", cfg.Server.Host, cfg.Server.Port)
	log.Printf("API endpoint: http://%s:%s/api", cfg.Server.Host, cfg.Server.Port)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start server: %v", err)
	}
}
