-- migrations/002_create_return_card_logs.sql

CREATE TABLE IF NOT EXISTS return_card_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_id INT NOT NULL,
    card_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    check_in VARCHAR(10) NOT NULL,
    check_out VARCHAR(10) NOT NULL,
    return_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'การคืนบัตรสำเร็จ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
    INDEX idx_card_id (card_id),
    INDEX idx_return_date (return_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;