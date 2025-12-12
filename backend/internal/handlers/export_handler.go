package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"backend/internal/models"
	"backend/internal/repository"
)

type ExportHandler struct {
	visitorRepo *repository.VisitorRepository
	exportRepo  *repository.ExportRepository
}

func NewExportHandler(visitorRepo *repository.VisitorRepository, exportRepo *repository.ExportRepository) *ExportHandler {
	return &ExportHandler{
		visitorRepo: visitorRepo,
		exportRepo:  exportRepo,
	}
}

// GetExportHistory handles GET /api/export-history
func (h *ExportHandler) GetExportHistory(w http.ResponseWriter, r *http.Request) {
	history, err := h.exportRepo.GetHistory()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get export history")
		return
	}

	respondWithJSON(w, http.StatusOK, history)
}

// CreateExportHistory handles POST /api/export-history
func (h *ExportHandler) CreateExportHistory(w http.ResponseWriter, r *http.Request) {
	var req models.ExportRecord
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Set created time if not provided
	if req.ExportDate == "" {
		req.ExportDate = time.Now().Format("2006-01-02 15:04:05")
	}

	record, err := h.exportRepo.Create(&req)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create export record")
		return
	}

	respondWithJSON(w, http.StatusCreated, record)
}
