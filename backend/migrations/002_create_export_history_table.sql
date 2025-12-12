-- สร้างตาราง export_history สำหรับเก็บประวัติการส่งออกข้อมูล
CREATE TABLE IF NOT EXISTS export_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    export_date VARCHAR(20) NOT NULL COMMENT 'วันที่และเวลาที่ส่งออก',
    department VARCHAR(100) NOT NULL COMMENT 'ส่วนงานที่เลือกส่งออก',
    date_range VARCHAR(100) NOT NULL COMMENT 'ช่วงวันที่ของข้อมูลที่ส่งออก',
    format VARCHAR(20) NOT NULL DEFAULT 'Excel' COMMENT 'รูปแบบไฟล์',
    status VARCHAR(20) NOT NULL DEFAULT 'เสร็จสิ้น' COMMENT 'สถานะการส่งออก',
    record_count INT NULL COMMENT 'จำนวนข้อมูลที่ส่งออก',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้างระเบียน',
    INDEX idx_export_date (export_date),
    INDEX idx_department (department),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางเก็บประวัติการส่งออกข้อมูล';