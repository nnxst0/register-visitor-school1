package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"backend/internal/models"

	"github.com/gorilla/mux"
)

// SearchByRFID handles GET /api/visitors/rfid/{cardId}
func (h *VisitorHandler) SearchByRFID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	cardId := vars["cardId"]

	if cardId == "" {
		respondWithError(w, http.StatusBadRequest, "RFID card ID is required")
		return
	}

	visitor, err := h.repo.GetByRFID(cardId)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "ไม่พบข้อมูลบัตร RFID นี้")
		return
	}

	// Create response with check-in/out times
	now := time.Now()
	response := models.RFIDCardResponse{
		ID:       visitor.RFID,
		Name:     visitor.FirstName + " " + visitor.LastName,
		CheckIn:  visitor.RegisteredAt.Format("15:04"),
		CheckOut: now.Format("15:04"),
	}

	respondWithJSON(w, http.StatusOK, response)
}

// ReturnCard handles POST /api/visitors/return/{cardId}
func (h *VisitorHandler) ReturnCard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	cardId := vars["cardId"]

	if cardId == "" {
		respondWithError(w, http.StatusBadRequest, "Card ID is required")
		return
	}

	var req models.ReturnCardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// 🔍 เช็คว่าบัตรนี้ถูกคืนวันนี้แล้วหรือยัง
	isDuplicate, err := h.repo.CheckDuplicateReturn(cardId)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check duplicate return")
		return
	}

	if isDuplicate {
		respondWithError(w, http.StatusConflict, "บัตรนี้ถูกคืนไปแล้ววันนี้ ไม่สามารถคืนบัตรซ้ำได้")
		return
	}

	// Get visitor by RFID
	visitor, err := h.repo.GetByRFID(cardId)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Visitor not found")
		return
	}

	// Create return log
	now := time.Now()
	log := &models.ReturnCardLog{
		VisitorID:  visitor.ID,
		CardID:     visitor.RFID,
		Name:       visitor.FirstName + " " + visitor.LastName,
		CheckIn:    visitor.RegisteredAt.Format("15:04"),
		CheckOut:   req.CheckOut,
		ReturnDate: now,
		Status:     "การคืนบัตรสำเร็จ",
	}

	if err := h.repo.CreateReturnLog(log); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create return log")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "คืนบัตรสำเร็จ",
		"log":     log,
	})
}

// GetReturnHistory handles GET /api/visitors/return-history
func (h *VisitorHandler) GetReturnHistory(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	search := r.URL.Query().Get("search")
	startDate := r.URL.Query().Get("startDate")
	endDate := r.URL.Query().Get("endDate")
	sortOrder := r.URL.Query().Get("sortOrder")

	logs, err := h.repo.GetReturnLogs(search, startDate, endDate, sortOrder)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get return history")
		return
	}

	// Transform to response format
	response := make([]models.ReturnCardHistoryResponse, len(logs))
	for i, log := range logs {
		response[i] = models.ReturnCardHistoryResponse{
			No:      i + 1,
			CardID:  log.CardID,
			Name:    log.Name,
			TimeIn:  log.CheckIn,
			TimeOut: log.CheckOut,
			Date:    log.ReturnDate.Format("02/01/2006"),
			Status:  log.Status,
		}
	}

	respondWithJSON(w, http.StatusOK, response)
}
