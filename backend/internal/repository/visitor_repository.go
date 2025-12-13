package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"backend/internal/models"
)

type VisitorRepository struct {
	db *sql.DB
}

func NewVisitorRepository(db *sql.DB) *VisitorRepository {
	return &VisitorRepository{db: db}
}

// Create inserts a new visitor into the database
func (r *VisitorRepository) Create(visitor *models.Visitor) error {
	query := `
		INSERT INTO visitors (
			id_card, first_name, last_name, birth_date, phone, license_plate,
			house_number, moo, soi, road, sub_district, district, province,
			rfid, department, officer_name, id_card_image
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := r.db.Exec(query,
		visitor.IDCard,
		visitor.FirstName,
		visitor.LastName,
		visitor.BirthDate,
		visitor.Phone,
		visitor.LicensePlate,
		visitor.HouseNumber,
		visitor.Moo,
		visitor.Soi,
		visitor.Road,
		visitor.SubDistrict,
		visitor.District,
		visitor.Province,
		visitor.RFID,
		visitor.Department,
		visitor.OfficerName,
		visitor.IDCardImage,
	)

	if err != nil {
		return fmt.Errorf("failed to create visitor: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to get last insert id: %w", err)
	}

	visitor.ID = int(id)
	return nil
}

// GetByID retrieves a visitor by ID
func (r *VisitorRepository) GetByID(id int) (*models.Visitor, error) {
	query := `
		SELECT id, id_card, first_name, last_name, birth_date, phone, license_plate,
			house_number, moo, soi, road, sub_district, district, province,
			rfid, department, officer_name, id_card_image, registered_at, exit_time, updated_at
		FROM visitors WHERE id = ?
	`

	visitor := &models.Visitor{}
	err := r.db.QueryRow(query, id).Scan(
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
		&visitor.ExitTime,
		&visitor.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("visitor not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get visitor: %w", err)
	}

	return visitor, nil
}

// List retrieves visitors with filters
func (r *VisitorRepository) List(params models.QueryParams) ([]models.Visitor, error) {
	query := `
		SELECT id, id_card, first_name, last_name, birth_date, phone, license_plate,
			house_number, moo, soi, road, sub_district, district, province,
			rfid, department, officer_name, id_card_image,
			registered_at, exit_time, updated_at
		FROM visitors WHERE 1=1
	`

	args := []interface{}{}

	// Search filter
	if params.Search != "" {
		query += ` AND (first_name LIKE ? OR last_name LIKE ? OR id_card LIKE ?)`
		searchTerm := "%" + params.Search + "%"
		args = append(args, searchTerm, searchTerm, searchTerm)
	}

	// Department filter
	if params.Department != "" && params.Department != "ทั้งหมด" {
		query += ` AND department = ?`
		args = append(args, params.Department)
	}

	// Date range filter
	if params.StartDate != "" {
		query += ` AND DATE(registered_at) >= ?`
		args = append(args, params.StartDate)
	}
	if params.EndDate != "" {
		query += ` AND DATE(registered_at) <= ?`
		args = append(args, params.EndDate)
	}

	// Sort order
	if params.SortOrder == "oldest" {
		query += ` ORDER BY registered_at ASC`
	} else {
		query += ` ORDER BY registered_at DESC`
	}

	// Pagination
	if params.Limit > 0 {
		query += ` LIMIT ?`
		args = append(args, params.Limit)

		if params.Page > 0 {
			offset := (params.Page - 1) * params.Limit
			query += ` OFFSET ?`
			args = append(args, offset)
		}
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list visitors: %w", err)
	}
	defer rows.Close()

	visitors := []models.Visitor{}
	for rows.Next() {
		var v models.Visitor
		err := rows.Scan(
			&v.ID,
			&v.IDCard,
			&v.FirstName,
			&v.LastName,
			&v.BirthDate,
			&v.Phone,
			&v.LicensePlate,
			&v.HouseNumber,
			&v.Moo,
			&v.Soi,
			&v.Road,
			&v.SubDistrict,
			&v.District,
			&v.Province,
			&v.RFID,
			&v.Department,
			&v.OfficerName,
			&v.IDCardImage,
			&v.RegisteredAt,
			&v.ExitTime,
			&v.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan visitor: %w", err)
		}
		visitors = append(visitors, v)
	}

	return visitors, nil
}

// ⭐ เพิ่มฟังก์ชันนี้สำหรับ Export
func (r *VisitorRepository) GetVisitorsForExport(startDate, endDate, department string) ([]models.Visitor, error) {
	query := `
		SELECT 
			id, id_card, first_name, last_name, birth_date, phone, license_plate,
			house_number, moo, soi, road, sub_district, district, province,
			rfid, department, officer_name, registered_at, exit_time
		FROM visitors 
		WHERE DATE(registered_at) BETWEEN ? AND ?
	`

	args := []interface{}{startDate, endDate}

	if department != "" && department != "ทั้งหมด" {
		query += ` AND department = ?`
		args = append(args, department)
	}

	query += ` ORDER BY registered_at DESC`

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query visitors: %w", err)
	}
	defer rows.Close()

	visitors := []models.Visitor{}
	for rows.Next() {
		var v models.Visitor
		var birthDate sql.NullTime
		var licensePlate, houseNumber, moo, soi, road, subDistrict, district, province sql.NullString
		var exitTime sql.NullTime

		err := rows.Scan(
			&v.ID, &v.IDCard, &v.FirstName, &v.LastName,
			&birthDate, &v.Phone, &licensePlate,
			&houseNumber, &moo, &soi, &road, &subDistrict, &district, &province,
			&v.RFID, &v.Department, &v.OfficerName,
			&v.RegisteredAt, &exitTime,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan visitor: %w", err)
		}

		if birthDate.Valid {
			v.BirthDate = &birthDate.Time
		}
		v.LicensePlate = licensePlate.String
		v.HouseNumber = houseNumber.String
		v.Moo = moo.String
		v.Soi = soi.String
		v.Road = road.String
		v.SubDistrict = subDistrict.String
		v.District = district.String
		v.Province = province.String

		if exitTime.Valid {
			v.ExitTime = &exitTime.Time
		}

		// สร้างชื่อเต็มและที่อยู่
		v.Name = v.FirstName + " " + v.LastName
		v.Address = buildFullAddress(&v)

		visitors = append(visitors, v)
	}

	return visitors, nil
}

// CheckIDCardExists checks if ID card already exists
func (r *VisitorRepository) CheckIDCardExists(idCard string) (bool, error) {
	query := `SELECT COUNT(*) FROM visitors WHERE id_card = ?`
	var count int
	err := r.db.QueryRow(query, idCard).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check id card: %w", err)
	}
	return count > 0, nil
}

// CheckRFIDExists checks if RFID already exists
func (r *VisitorRepository) CheckRFIDExists(rfid string) (bool, error) {
	query := `SELECT COUNT(*) FROM visitors WHERE rfid = ?`
	var count int
	err := r.db.QueryRow(query, rfid).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check rfid: %w", err)
	}
	return count > 0, nil
}

// CheckDuplicateReturn เช็คว่าบัตรถูกคืนวันนี้แล้วหรือยัง
func (r *VisitorRepository) CheckDuplicateReturn(cardId string) (bool, error) {
	query := `
		SELECT COUNT(*) 
		FROM return_card_logs 
		WHERE card_id = ? 
		AND DATE(return_date) = CURDATE()
	`

	var count int
	err := r.db.QueryRow(query, cardId).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check duplicate return: %w", err)
	}

	return count > 0, nil
}

// FormatAddress จัดรูปแบบที่อยู่แบบสั้น
func FormatAddress(v *models.Visitor) string {
	parts := []string{}

	if v.HouseNumber != "" {
		parts = append(parts, v.HouseNumber)
	}
	if v.Moo != "" {
		parts = append(parts, "ม."+v.Moo)
	}
	if v.Soi != "" {
		parts = append(parts, "ซ."+v.Soi)
	}
	if v.Road != "" {
		parts = append(parts, "ถ."+v.Road)
	}
	if v.SubDistrict != "" {
		parts = append(parts, "ต."+v.SubDistrict)
	}
	if v.District != "" {
		parts = append(parts, "อ."+v.District)
	}
	if v.Province != "" {
		parts = append(parts, "จ."+v.Province)
	}

	if len(parts) == 0 {
		return "-"
	}

	return strings.Join(parts, " ")
}

// ⭐ buildFullAddress สร้างที่อยู่เต็มสำหรับ Export
func buildFullAddress(v *models.Visitor) string {
	parts := []string{}

	if v.HouseNumber != "" {
		parts = append(parts, "บ้านเลขที่ "+v.HouseNumber)
	}
	if v.Moo != "" {
		parts = append(parts, "หมู่ "+v.Moo)
	}
	if v.Soi != "" {
		parts = append(parts, "ซอย "+v.Soi)
	}
	if v.Road != "" {
		parts = append(parts, "ถนน "+v.Road)
	}
	if v.SubDistrict != "" {
		parts = append(parts, "ตำบล "+v.SubDistrict)
	}
	if v.District != "" {
		parts = append(parts, "อำเภอ "+v.District)
	}
	if v.Province != "" {
		parts = append(parts, "จังหวัด "+v.Province)
	}

	if len(parts) == 0 {
		return "-"
	}

	return strings.Join(parts, " ")
}

// FormatThaiDate formats date to Thai format
func FormatThaiDate(t *time.Time) string {
	if t == nil {
		return "-"
	}
	return t.Format("02/01/2006")
}
