package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/internal/models"
	"backend/internal/repository"

	"github.com/gorilla/mux"
)

type VisitorHandler struct {
	repo *repository.VisitorRepository
}

func NewVisitorHandler(repo *repository.VisitorRepository) *VisitorHandler {
	return &VisitorHandler{repo: repo}
}

// CreateVisitor handles POST /api/visitors
func (h *VisitorHandler) CreateVisitor(w http.ResponseWriter, r *http.Request) {
	var req models.CreateVisitorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if req.IDCard == "" || len(req.IDCard) != 13 {
		respondWithError(w, http.StatusBadRequest, "ID card must be 13 digits")
		return
	}
	if req.FirstName == "" {
		respondWithError(w, http.StatusBadRequest, "First name is required")
		return
	}
	if req.LastName == "" {
		respondWithError(w, http.StatusBadRequest, "Last name is required")
		return
	}
	if req.Phone == "" {
		respondWithError(w, http.StatusBadRequest, "Phone is required")
		return
	}

	// Check if ID card already exists
	exists, err := h.repo.CheckIDCardExists(req.IDCard)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check ID card")
		return
	}
	if exists {
		respondWithError(w, http.StatusConflict, "ID card already registered")
		return
	}

	// Check if RFID already exists (only if RFID is provided)
	if req.RFID != "" {
		rfidExists, err := h.repo.CheckRFIDExists(req.RFID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to check RFID")
			return
		}
		if rfidExists {
			respondWithError(w, http.StatusConflict, "RFID already registered")
			return
		}
	}

	// Parse birth date
	var birthDate *time.Time
	if req.BirthDate != nil && *req.BirthDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid birth date format")
			return
		}
		birthDate = &parsed
	}

	// Create visitor
	visitor := &models.Visitor{
		IDCard:       req.IDCard,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		BirthDate:    birthDate,
		Phone:        req.Phone,
		LicensePlate: req.LicensePlate,
		HouseNumber:  req.HouseNumber,
		Moo:          req.Moo,
		Soi:          req.Soi,
		Road:         req.Road,
		SubDistrict:  req.SubDistrict,
		District:     req.District,
		Province:     req.Province,
		RFID:         req.RFID,
		Department:   req.Department,
		OfficerName:  req.OfficerName,
		IDCardImage:  req.IDCardImage,
	}

	if err := h.repo.Create(visitor); err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create visitor: %v", err))
		return
	}

	respondWithJSON(w, http.StatusCreated, visitor)
}

// GetVisitor handles GET /api/visitors/{id}
func (h *VisitorHandler) GetVisitor(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid visitor ID")
		return
	}

	visitor, err := h.repo.GetByID(id)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Visitor not found")
		return
	}

	respondWithJSON(w, http.StatusOK, visitor)
}

// ListVisitors handles GET /api/visitors
func (h *VisitorHandler) ListVisitors(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	params := models.QueryParams{
		Search:     r.URL.Query().Get("search"),
		StartDate:  r.URL.Query().Get("startDate"),
		EndDate:    r.URL.Query().Get("endDate"),
		SortOrder:  r.URL.Query().Get("sortOrder"),
		Department: r.URL.Query().Get("department"),
	}

	// Parse pagination
	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		page, err := strconv.Atoi(pageStr)
		if err == nil && page > 0 {
			params.Page = page
		}
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err == nil && limit > 0 {
			params.Limit = limit
		}
	}

	// Set default sort order
	if params.SortOrder == "" {
		params.SortOrder = "latest"
	}

	visitors, err := h.repo.List(params)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to list visitors: %v", err))
		return
	}

	// Transform to response format
	response := make([]models.VisitorListResponse, len(visitors))
	for i, v := range visitors {
		birthDate := "-"
		if v.BirthDate != nil {
			birthDate = v.BirthDate.Format("02/01/06")
		}

		phone := v.Phone
		if len(phone) == 10 {
			phone = phone[:3] + "-" + phone[3:]
		}

		licensePlate := "-"
		if v.LicensePlate != "" {
			licensePlate = v.LicensePlate
		}

		exitTime := "-"
		if v.ExitTime != nil {
			exitTime = v.ExitTime.Format("02/01/2006 15:04:05")
		}

		response[i] = models.VisitorListResponse{
			ID:           v.ID,
			IDCard:       v.IDCard,
			Name:         v.FirstName + " " + v.LastName,
			BirthDate:    birthDate,
			Phone:        phone,
			LicensePlate: licensePlate,                 // ⭐ เพิ่มบรรทัดนี้
			Address:      repository.FormatAddress(&v), // ⭐ ใช้แบบเต็ม
			RFID:         v.RFID,
			Department:   v.Department,
			OfficerName:  v.OfficerName,
			RegisteredAt: v.RegisteredAt.Format("02/01/2006 15:04:05"),
			ExitTime:     exitTime,
		}
	}

	respondWithJSON(w, http.StatusOK, response)
}

// Helper functions
func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error": "Internal server error"}`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}
