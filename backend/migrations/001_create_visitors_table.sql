-- Create database
CREATE DATABASE IF NOT EXISTS visitor_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE visitor_system;

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_card VARCHAR(13) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    phone VARCHAR(15) NOT NULL,
    license_plate VARCHAR(20),
    house_number VARCHAR(50),
    moo VARCHAR(20),
    soi VARCHAR(100),
    road VARCHAR(100),
    sub_district VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    rfid VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(200),
    officer_name VARCHAR(200),
    id_card_image LONGTEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_id_card (id_card),
    INDEX idx_rfid (rfid),
    INDEX idx_registered_at (registered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for searching
CREATE INDEX idx_name ON visitors(first_name, last_name);
CREATE INDEX idx_department ON visitors(department);