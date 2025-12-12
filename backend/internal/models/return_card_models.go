package models

import "time"

// ReturnCardLog represents a return card history record
type ReturnCardLog struct {
	ID         int       `json:"id" db:"id"`
	VisitorID  int       `json:"visitorId" db:"visitor_id"`
	CardID     string    `json:"cardId" db:"card_id"`
	Name       string    `json:"name" db:"name"`
	CheckIn    string    `json:"checkIn" db:"check_in"`
	CheckOut   string    `json:"checkOut" db:"check_out"`
	ReturnDate time.Time `json:"returnDate" db:"return_date"`
	Status     string    `json:"status" db:"status"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
}

// ReturnCardRequest represents the request body for returning a card
type ReturnCardRequest struct {
	CheckOut string `json:"checkOut" validate:"required"`
}

// ReturnCardHistoryResponse represents the response for return card history
type ReturnCardHistoryResponse struct {
	No      int    `json:"no"`
	CardID  string `json:"cardId"`
	Name    string `json:"name"`
	TimeIn  string `json:"timeIn"`
	TimeOut string `json:"timeOut"`
	Date    string `json:"date"`
	Status  string `json:"status"`
}

// RFIDCardResponse represents the response when searching by RFID
type RFIDCardResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	CheckIn  string `json:"checkIn"`
	CheckOut string `json:"checkOut"`
}
