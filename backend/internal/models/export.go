package models

// ExportRecord represents an export history record
type ExportRecord struct {
	ID          int     `json:"id,omitempty"`
	ExportDate  string  `json:"exportDate"`
	Department  string  `json:"department"`
	DateRange   string  `json:"dateRange"`
	Format      string  `json:"format"`
	Status      string  `json:"status"`
	RecordCount *int    `json:"recordCount,omitempty"`
	CreatedAt   *string `json:"createdAt,omitempty"`
}
