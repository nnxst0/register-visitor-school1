package repository

import (
	"database/sql"
	"fmt"
	"time"

	"backend/internal/models"
)

// GetByRFID retrieves a visitor by RFID card
func (r *VisitorRepository) GetByRFID(rfid string) (*models.Visitor, error) {
	query := `
		SELECT id, id_card, first_name, last_name, birth_date, phone, license_plate,
			house_number, moo, soi, road, sub_district, district, province,
			rfid, department, officer_name, id_card_image, registered_at, updated_at
		FROM visitors WHERE rfid = ?
	`

	visitor := &models.Visitor{}
	err := r.db.QueryRow(query, rfid).Scan(
		&visitor.ID,
		&visitor.IDCard,
		&visitor.FirstName,
		&visitor.LastName,
		&visitor.BirthDate,
		&visitor.Phone,
		&visitor.LicensePlate,
		&visitor.HouseNumber,
		&visitor.Moo,
		&visitor.Soi,
		&visitor.Road,
		&visitor.SubDistrict,
		&visitor.District,
		&visitor.Province,
		&visitor.RFID,
		&visitor.Department,
		&visitor.OfficerName,
		&visitor.IDCardImage,
		&visitor.RegisteredAt,
		&visitor.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("visitor not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get visitor by RFID: %w", err)
	}

	return visitor, nil
}

// CreateReturnLog creates a new return card log
func (r *VisitorRepository) CreateReturnLog(log *models.ReturnCardLog) error {
	query := `
		INSERT INTO return_card_logs (
			visitor_id, card_id, name, check_in, check_out, return_date, status
		) VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	result, err := r.db.Exec(query,
		log.VisitorID,
		log.CardID,
		log.Name,
		log.CheckIn,
		log.CheckOut,
		log.ReturnDate,
		log.Status,
	)

	if err != nil {
		return fmt.Errorf("failed to create return log: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert id: %w", err)
	}

	log.ID = int(id)
	return nil
}

// GetReturnLogs retrieves return card logs with filters
func (r *VisitorRepository) GetReturnLogs(search, startDate, endDate, sortOrder string) ([]models.ReturnCardLog, error) {
	query := `
		SELECT id, visitor_id, card_id, name, check_in, check_out, return_date, status, created_at
		FROM return_card_logs WHERE 1=1
	`

	args := []interface{}{}

	// Search filter
	if search != "" {
		query += ` AND (card_id LIKE ? OR name LIKE ?)`
		searchTerm := "%" + search + "%"
		args = append(args, searchTerm, searchTerm)
	}

	// Date range filter
	if startDate != "" {
		query += ` AND DATE(return_date) >= ?`
		args = append(args, startDate)
	}
	if endDate != "" {
		query += ` AND DATE(return_date) <= ?`
		args = append(args, endDate)
	}

	// Sort order by check_in time
	if sortOrder == "asc" {
		query += ` ORDER BY check_in ASC`
	} else if sortOrder == "desc" {
		query += ` ORDER BY check_in DESC`
	} else {
		query += ` ORDER BY created_at DESC`
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get return logs: %w", err)
	}
	defer rows.Close()

	logs := []models.ReturnCardLog{}
	for rows.Next() {
		var log models.ReturnCardLog
		err := rows.Scan(
			&log.ID,
			&log.VisitorID,
			&log.CardID,
			&log.Name,
			&log.CheckIn,
			&log.CheckOut,
			&log.ReturnDate,
			&log.Status,
			&log.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan return log: %w", err)
		}
		logs = append(logs, log)
	}

	return logs, nil
}

// Helper function to format time
func formatTime(t time.Time) string {
	return t.Format("15:04")
}
