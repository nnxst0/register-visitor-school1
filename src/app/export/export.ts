import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ExportRecord {
  exportDate: string;
  department: string;
  dateRange: string;
  format: string;
  status: string;
}

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export.html',
  styleUrls: ['./export.css']
})
export class ExportComponent implements OnInit {
  // Form data
  selectedDepartment: string = 'ทั้งหมด';
  startDate: string = '';
  endDate: string = '';
  selectedFormat: string = 'CSV';

  // History filters
  filterStartDate: string = '';
  filterEndDate: string = '';
  sortOrder: string = 'desc';

  // Export history data (original data)
  originalExportHistory: ExportRecord[] = [
    {
      exportDate: '2025-09-28 15:24:34',
      department: 'ทั้งหมด',
      dateRange: '2025-09-26 - 2025-09-27',
      format: 'Excel',
      status: 'เสร็จสิ้น'
    },
    {
      exportDate: '2025-09-28 15:23:46',
      department: 'ทั้งหมด',
      dateRange: '2025-09-26 - 2025-09-27',
      format: 'CSV',
      status: 'ล้มเหลว'
    },
    {
      exportDate: '2025-09-25 11:47:52',
      department: 'กลุ่มบริหารวิชาการ',
      dateRange: '2025-09-20 - 2025-09-24',
      format: 'Excel',
      status: 'เสร็จสิ้น'
    }
  ];

  // Filtered history (ข้อมูลที่แสดง)
  exportHistory: ExportRecord[] = [];

  constructor() { }

  ngOnInit(): void {
    // Initialize component with today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    this.startDate = `${year}-${month}-${day}`;
    this.endDate = `${year}-${month}-${day}`;

    // แสดงข้อมูลทั้งหมดตอนเริ่มต้น
    this.exportHistory = [...this.originalExportHistory];
  }

  /**
   * Select export format
   */
  selectFormat(format: string): void {
    this.selectedFormat = format;
  }

  /**
   * Export data based on selected criteria
   */
  exportData(): void {
    if (!this.startDate || !this.endDate) {
      alert('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }

    // ตรวจสอบว่าวันที่เริ่มต้นไม่มากกว่าวันที่สิ้นสุด
    if (new Date(this.startDate) > new Date(this.endDate)) {
      alert('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
      return;
    }

    // แปลงวันที่จาก YYYY-MM-DD เป็น DD/MM/YYYY (พ.ศ.)
    const formattedStartDate = this.formatDateThai(this.startDate);
    const formattedEndDate = this.formatDateThai(this.endDate);

    const exportData = {
      department: this.selectedDepartment,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      format: this.selectedFormat
    };

    console.log('Exporting data:', exportData);

    // Add new export record to history
    const newRecord: ExportRecord = {
      exportDate: this.getCurrentDateTime(),
      department: this.selectedDepartment,
      dateRange: `${formattedStartDate} - ${formattedEndDate}`,
      format: this.selectedFormat,
      status: 'เสร็จสิ้น'
    };

    this.originalExportHistory.unshift(newRecord);
    
    // อัพเดทข้อมูลที่แสดงด้วย
    this.applyFilters();

    // TODO: Implement actual export logic
    alert(`กำลังส่งออกข้อมูลในรูปแบบ ${this.selectedFormat}`);
  }

  /**
   * แปลงวันที่จาก YYYY-MM-DD เป็น DD/MM/YYYY (พ.ศ.)
   */
  formatDateThai(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.

    return `${day}/${month}/${year}`;
  }

  /**
   * Get current date and time in Thai format
   */
  getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Sort export history
   */
  sortHistory(): void {
    if (this.sortOrder === 'desc') {
      this.exportHistory.sort((a, b) => 
        new Date(b.exportDate).getTime() - new Date(a.exportDate).getTime()
      );
    } else {
      this.exportHistory.sort((a, b) => 
        new Date(a.exportDate).getTime() - new Date(b.exportDate).getTime()
      );
    }
  }

  /**
   * Apply all filters to export history
   */
  applyFilters(): void {
    let filtered = [...this.originalExportHistory];

    // กรองตามช่วงวันที่
    if (this.filterStartDate && this.filterEndDate) {
      const filterStart = new Date(this.filterStartDate);
      const filterEnd = new Date(this.filterEndDate);
      
      // ตั้งเวลาให้ครอบคลุมทั้งวัน
      filterStart.setHours(0, 0, 0, 0);
      filterEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.exportDate);
        return recordDate >= filterStart && recordDate <= filterEnd;
      });
    } else if (this.filterStartDate) {
      // กรองเฉพาะวันที่เริ่มต้น (ตั้งแต่วันนั้นเป็นต้นไป)
      const filterStart = new Date(this.filterStartDate);
      filterStart.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.exportDate);
        return recordDate >= filterStart;
      });
    } else if (this.filterEndDate) {
      // กรองเฉพาะวันที่สิ้นสุด (จนถึงวันนั้น)
      const filterEnd = new Date(this.filterEndDate);
      filterEnd.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.exportDate);
        return recordDate <= filterEnd;
      });
    }

    this.exportHistory = filtered;
    
    // เรียงลำดับตามที่เลือก
    this.sortHistory();
  }

  /**
   * Clear filters and show all records
   */
  clearFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.exportHistory = [...this.originalExportHistory];
    this.sortHistory();
  }

  /**
   * Filter history by date (เรียกใช้เมื่อมีการเปลี่ยนแปลงช่วงวันที่)
   */
  filterHistory(): void {
    this.applyFilters();
  }
}