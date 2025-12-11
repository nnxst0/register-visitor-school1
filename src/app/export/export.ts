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
  // Declare SweetAlert2
  private Swal: any;

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

    // Load SweetAlert2
    this.loadSweetAlert();
  }

  /**
   * Load SweetAlert2 library
   */
  loadSweetAlert(): void {
    if (typeof (window as any).Swal !== 'undefined') {
      this.Swal = (window as any).Swal;
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      script.onload = () => {
        this.Swal = (window as any).Swal;
      };
      document.head.appendChild(script);
    }
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
      this.showErrorAlert('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }

    // ตรวจสอบว่าวันที่เริ่มต้นไม่มากกว่าวันที่สิ้นสุด
    if (new Date(this.startDate) > new Date(this.endDate)) {
      this.showErrorAlert('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
      return;
    }

    // แปลงวันที่จาก YYYY-MM-DD เป็น DD/MM/YYYY (พ.ศ.)
    const formattedStartDate = this.formatDateThai(this.startDate);
    const formattedEndDate = this.formatDateThai(this.endDate);

    // แสดง Confirmation Dialog
    this.showExportConfirmation({
      department: this.selectedDepartment,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      format: this.selectedFormat
    });
  }

  /**
   * แสดง Confirmation Dialog สำหรับการส่งออกข้อมูล
   */
  showExportConfirmation(data: any): void {
    if (!this.Swal) {
      alert('กำลังโหลด SweetAlert2...');
      return;
    }

    const htmlContent = `
      <div style="text-align: left; padding: 10px;">
        <div style="margin-bottom: 18px;">
          <strong style="color: #2E50BC;">รายละเอียดการส่งออกข้อมูล</strong>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>ส่วนงาน:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #666;">${data.department}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>วันที่เริ่มต้น:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #666;">${data.startDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>วันที่สิ้นสุด:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #666;">${data.endDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>รูปแบบไฟล์:</strong></td>
            <td style="padding: 8px; color: #666; font-weight: 600;">${data.format}</td>
          </tr>
        </table>
      </div>
    `;

    this.Swal.fire({
      title: 'ยืนยันการส่งออกข้อมูล',
      html: htmlContent,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      width: '550px'
    }).then((result: any) => {
      if (result.isConfirmed) {
        // เริ่มกระบวนการส่งออก
        this.performExport(data);
      }
    });
  }

  /**
   * ทำการส่งออกข้อมูลจริง
   */
  performExport(data: any): void {
    // แสดง Loading
    this.showLoadingAlert();

    // จำลองการส่งออก (ใช้ setTimeout แทน API call จริง)
    setTimeout(() => {
      // Add new export record to history
      const newRecord: ExportRecord = {
        exportDate: this.getCurrentDateTime(),
        department: data.department,
        dateRange: `${data.startDate} - ${data.endDate}`,
        format: data.format,
        status: 'เสร็จสิ้น'
      };

      this.originalExportHistory.unshift(newRecord);
      
      // อัพเดทข้อมูลที่แสดงด้วย
      this.applyFilters();

      // ปิด Loading และแสดง Success
      this.Swal.close();
      this.showExportSuccessAlert(data.format);

      // TODO: Implement actual export logic here
      console.log('Exporting data:', data);
    }, 2000); // จำลองเวลา 2 วินาที
  }

  /**
   * แสดง Loading Alert ขณะส่งออกข้อมูล
   */
  showLoadingAlert(): void {
    if (!this.Swal) return;

    this.Swal.fire({
      title: 'กำลังส่งออกข้อมูล...',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div class="spinner" style="margin: 0 auto 15px;"></div>
          <p style="color: #666;">โปรดรอสักครู่ ระบบกำลังประมวลผลข้อมูล</p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        const style = document.createElement('style');
        style.textContent = `
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #2E50BC;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    });
  }

  /**
   * แสดง Success Alert หลังส่งออกสำเร็จ
   */
  showExportSuccessAlert(format: string): void {
    if (!this.Swal) return;

    this.Swal.fire({
      icon: 'success',
      title: 'ส่งออกข้อมูลสำเร็จ!',
      html: `
        <div style="text-align: center; padding: 10px;">
          <p style="font-size: 16px; color: #666;">ไฟล์ ${format} ถูกส่งออกเรียบร้อยแล้ว</p>
        </div>
      `,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#4CAF50',
      timer: 3000,
      timerProgressBar: true
    });
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

  /**
   * SweetAlert2 Helper Functions
   */
  showErrorAlert(message: string): void {
    if (this.Swal) {
      this.Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: message,
        confirmButtonText: 'ตรวจสอบอีกครั้ง',
        confirmButtonColor: '#FBB903'
      });
    } else {
      alert(message);
    }
  }

  showSuccessAlert(title: string, message: string): void {
    if (this.Swal) {
      this.Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#FBB903',
        timer: 2000,
        timerProgressBar: true
      });
    } else {
      alert(title + ': ' + message);
    }
  }

  showWarningAlert(message: string): void {
    if (this.Swal) {
      this.Swal.fire({
        icon: 'warning',
        title: 'คำเตือน',
        text: message,
        confirmButtonText: 'รับทราบ',
        confirmButtonColor: '#FBB903'
      });
    } else {
      alert(message);
    }
  }
}