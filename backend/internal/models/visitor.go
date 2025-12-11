package models

import (
	"time"
)

// Visitor represents a visitor in the system
type Visitor struct {
	ID           int        `json:"id" db:"id"`
	IDCard       string     `json:"idCard" db:"id_card"`
	FirstName    string     `json:"firstName" db:"first_name"`
	LastName     string     `json:"lastName" db:"last_name"`
	BirthDate    *time.Time `json:"birthDate" db:"birth_date"`
	Phone        string     `json:"phone" db:"phone"`
	LicensePlate string     `json:"licensePlate" db:"license_plate"`
	HouseNumber  string     `json:"houseNumber" db:"house_number"`
	Moo          string     `json:"moo" db:"moo"`
	Soi          string     `json:"soi" db:"soi"`
	Road         string     `json:"road" db:"road"`
	SubDistrict  string     `json:"subDistrict" db:"sub_district"`
	District     string     `json:"district" db:"district"`
	Province     string     `json:"province" db:"province"`
	RFID         string     `json:"rfid" db:"rfid"`
	Department   string     `json:"department" db:"department"`
	OfficerName  string     `json:"officerName" db:"officer_name"`
	IDCardImage  string     `json:"idCardImage" db:"id_card_image"`
	RegisteredAt time.Time  `json:"registeredAt" db:"registered_at"`
	UpdatedAt    time.Time  `json:"updatedAt" db:"updated_at"`
}

// CreateVisitorRequest represents the request body for creating a visitor
type CreateVisitorRequest struct {
	IDCard       string  `json:"idCard" validate:"required,len=13"`
	FirstName    string  `json:"firstName" validate:"required"`
	LastName     string  `json:"lastName" validate:"required"`
	BirthDate    *string `json:"birthDate"`
	Phone        string  `json:"phone" validate:"required"`
	LicensePlate string  `json:"licensePlate"`
	HouseNumber  string  `json:"houseNumber"`
	Moo          string  `json:"moo"`
	Soi          string  `json:"soi"`
	Road         string  `json:"road"`
	SubDistrict  string  `json:"subDistrict"`
	District     string  `json:"district"`
	Province     string  `json:"province"`
	RFID         string  `json:"rfid" validate:"required"`
	Department   string  `json:"department"`
	OfficerName  string  `json:"officerName"`
	IDCardImage  string  `json:"idCardImage"`
}

// VisitorListResponse represents the response for visitor list
type VisitorListResponse struct {
	ID           int    `json:"id"`
	IDCard       string `json:"idCard"`
	Name         string `json:"name"`
	BirthDate    string `json:"birthDate"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
	RFID         string `json:"rfid"`
	Department   string `json:"department"`
	OfficerName  string `json:"officerName"`
	RegisteredAt string `json:"registeredAt"`
}

// QueryParams represents query parameters for filtering
type QueryParams struct {
	Search    string `json:"search"`
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
	SortOrder string `json:"sortOrder"` // "latest" or "oldest"
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
}
