package repository

import (
	"backend/internal/models"
	"database/sql"
)

type ExportRepository struct {
	db *sql.DB
}

func NewExportRepository(db *sql.DB) *ExportRepository {
	return &ExportRepository{db: db}
}

// GetHistory retrieves all export history records
func (r *ExportRepository) GetHistory() ([]models.ExportRecord, error) {
	query := `
		SELECT id, export_date, department, date_range, format, status, record_count, created_at
		FROM export_history
		ORDER BY export_date DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.ExportRecord
	for rows.Next() {
		var record models.ExportRecord
		var recordCount sql.NullInt64
		var createdAt sql.NullTime

		err := rows.Scan(
			&record.ID,
			&record.ExportDate,
			&record.Department,
			&record.DateRange,
			&record.Format,
			&record.Status,
			&recordCount,
			&createdAt,
		)
		if err != nil {
			return nil, err
		}

		if recordCount.Valid {
			count := int(recordCount.Int64)
			record.RecordCount = &count
		}

		history = append(history, record)
	}

	return history, nil
}

// Create inserts a new export history record
func (r *ExportRepository) Create(record *models.ExportRecord) (*models.ExportRecord, error) {
	query := `
		INSERT INTO export_history (export_date, department, date_range, format, status, record_count)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := r.db.Exec(
		query,
		record.ExportDate,
		record.Department,
		record.DateRange,
		record.Format,
		record.Status,
		record.RecordCount,
	)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	record.ID = int(id)
	return record, nil
}

// GetByID retrieves a single export history record by ID
func (r *ExportRepository) GetByID(id int) (*models.ExportRecord, error) {
	query := `
		SELECT id, export_date, department, date_range, format, status, record_count, created_at
		FROM export_history
		WHERE id = ?
	`

	var record models.ExportRecord
	var recordCount sql.NullInt64
	var createdAt sql.NullTime

	err := r.db.QueryRow(query, id).Scan(
		&record.ID,
		&record.ExportDate,
		&record.Department,
		&record.DateRange,
		&record.Format,
		&record.Status,
		&recordCount,
		&createdAt,
	)
	if err != nil {
		return nil, err
	}

	if recordCount.Valid {
		count := int(recordCount.Int64)
		record.RecordCount = &count
	}

	return &record, nil
}
