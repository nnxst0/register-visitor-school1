import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as XLSX from 'xlsx';

interface ExportRecord {
  id?: number;
  exportDate: string;
  department: string;
  dateRange: string;
  format: string;
  status: string;
  recordCount?: number;
}

interface Visitor {
  id: number;
  idCard: string;
  name: string;
  birthDate: string;
  phone: string;
  licensePlate?: string;
  address: string;
  rfid: string;
  department: string;
  officerName: string;
  registeredAt: string;
  exitTime?: string;
}

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export.html',
  styleUrls: ['./export.css']
})
export class ExportComponent implements OnInit {
  public Swal: any;
  private apiUrl = 'http://localhost:8080/api'; // ปรับตาม API ของคุณ

  // Form data
  selectedDepartment: string = 'ทั้งหมด';
  startDate: string = '';
  endDate: string = '';

  // History filters
  filterStartDate: string = '';
  filterEndDate: string = '';
  sortOrder: string = 'desc';

  // Export history data
  originalExportHistory: ExportRecord[] = [];
  exportHistory: ExportRecord[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    this.startDate = `${year}-${month}-${day}`;
    this.endDate = `${year}-${month}-${day}`;

    this.loadSweetAlert();
    this.loadExportHistory();
  }

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
   * โหลดประวัติการส่งออกจาก API
   */
  loadExportHistory(): void {
    this.http.get<ExportRecord[]>(`${this.apiUrl}/export-history`).subscribe({
      next: (data) => {
        this.originalExportHistory = data;
        this.exportHistory = [...data];
        this.sortHistory();
      },
      error: (error) => {
        console.error('Error loading export history:', error);
        this.originalExportHistory = [];
        this.exportHistory = [];
      }
    });
  }

  /**
   * ส่งออกข้อมูล
   */
  exportData(): void {
    if (!this.startDate || !this.endDate) {
      this.showErrorAlert('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด');
      return;
    }

    if (new Date(this.startDate) > new Date(this.endDate)) {
      this.showErrorAlert('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
      return;
    }

    const formattedStartDate = this.formatDateThai(this.startDate);
    const formattedEndDate = this.formatDateThai(this.endDate);

    this.showExportConfirmation({
      department: this.selectedDepartment,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      format: 'Excel'
    });
  }

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
        this.performExport(data);
      }
    });
  }

  /**
   * ทำการส่งออกข้อมูลจริง
   */
  performExport(data: any): void {
    this.showLoadingAlert();

    // สร้าง query parameters
    let params = new HttpParams()
      .set('startDate', this.startDate)
      .set('endDate', this.endDate);

    if (this.selectedDepartment !== 'ทั้งหมด') {
      params = params.set('department', this.selectedDepartment);
    }

    // ดึงข้อมูลจาก API
    this.http.get<Visitor[]>(`${this.apiUrl}/visitors`, { params }).subscribe({
      next: (visitors) => {
        if (visitors.length === 0) {
          this.Swal.close();
          this.showWarningAlert('ไม่พบข้อมูลในช่วงวันที่ที่เลือก');
          return;
        }

        // สร้างไฟล์ Excel
        this.generateExcelFile(visitors);

        // บันทึกประวัติการส่งออก
        this.saveExportHistory(data, visitors.length);

        this.Swal.close();
        this.showExportSuccessAlert('Excel', visitors.length);
      },
      error: (error) => {
        console.error('Export error:', error);
        this.Swal.close();
        this.showErrorAlert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
      }
    });
  }

  generateExcelFile(visitors: Visitor[]): void {
    const excelData = visitors.map((v, index) => ({
      'ลำดับ': index + 1,
      'เลขบัตรประชาชน': this.formatIDCard(v.idCard),
      'ชื่อ-นามสกุล': v.name,
      'วันเกิด': v.birthDate,
      'เบอร์โทรศัพท์': v.phone,
      'ทะเบียนรถ': v.licensePlate || '-',
      'ที่อยู่': v.address, 
      'RFID': v.rfid || '-',
      'ส่วนงานที่ติดต่อ': v.department,
      'เจ้าหน้าที่': v.officerName,
      'วันที่ลงทะเบียน': v.registeredAt,
      'เวลาออก': v.exitTime || '-'
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลผู้มาติดต่อ');

    const colWidths = [
      { wch: 8 },  // ลำดับ
      { wch: 18 }, // เลขบัตรประชาชน
      { wch: 25 }, // ชื่อ-นามสกุล
      { wch: 12 }, // วันเกิด
      { wch: 15 }, // เบอร์โทรศัพท์
      { wch: 15 }, // ⭐ ทะเบียนรถ (เพิ่มใหม่)
      { wch: 60 }, // ⭐ ที่อยู่ (เพิ่มความกว้าง)
      { wch: 15 }, // RFID
      { wch: 25 }, // ส่วนงาน
      { wch: 20 }, // เจ้าหน้าที่
      { wch: 20 },  // วันที่ลงทะเบียน
      { wch: 20 }  // ⭐ เวลาออก
    ];
    ws['!cols'] = colWidths;

    // สร้างชื่อไฟล์
    const fileName = `ผู้มาติดต่อ_${this.selectedDepartment}_${this.formatDateForFile(this.startDate)}_${this.formatDateForFile(this.endDate)}.xlsx`;

    // ดาวน์โหลดไฟล์
    XLSX.writeFile(wb, fileName);
  }

  /**
   * บันทึกประวัติการส่งออก
   */
  saveExportHistory(data: any, recordCount: number): void {
    const newRecord: ExportRecord = {
      exportDate: this.getCurrentDateTime(),
      department: data.department,
      dateRange: `${data.startDate} - ${data.endDate}`,
      format: 'Excel',
      status: 'เสร็จสิ้น',
      recordCount: recordCount
    };

    // บันทึกไปยัง API
    this.http.post(`${this.apiUrl}/export-history`, newRecord).subscribe({
      next: (savedRecord: any) => {
        this.originalExportHistory.unshift(savedRecord);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error saving export history:', error);
        // ถึงแม้บันทึกประวัติไม่สำเร็จ ก็ยังแสดงในหน้าจอ
        this.originalExportHistory.unshift(newRecord);
        this.applyFilters();
      }
    });
  }

  /**
   * จัดรูปแบบเลขบัตรประชาชน
   */
  formatIDCard(idCard: string): string {
    if (!idCard || idCard.length !== 13) return idCard;
    return `${idCard.substr(0, 1)}-${idCard.substr(1, 4)}-${idCard.substr(5, 5)}-${idCard.substr(10, 2)}-${idCard.substr(12, 1)}`;
  }

  /**
   * จัดรูปแบบวันที่สำหรับชื่อไฟล์
   */
  formatDateForFile(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  formatDateThai(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear() + 543;

    return `${day}/${month}/${year}`;
  }

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

  applyFilters(): void {
    let filtered = [...this.originalExportHistory];

    if (this.filterStartDate && this.filterEndDate) {
      const filterStart = new Date(this.filterStartDate);
      const filterEnd = new Date(this.filterEndDate);

      filterStart.setHours(0, 0, 0, 0);
      filterEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.exportDate);
        return recordDate >= filterStart && recordDate <= filterEnd;
      });
    } else if (this.filterStartDate) {
      const filterStart = new Date(this.filterStartDate);
      filterStart.setHours(0, 0, 0, 0);

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.exportDate);
        return recordDate >= filterStart;
      });
    } else if (this.filterEndDate) {
      const filterEnd = new Date(this.filterEndDate);
      filterEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter(record => {
        const recordDate = new Date(record.exportDate);
        return recordDate <= filterEnd;
      });
    }

    this.exportHistory = filtered;
    this.sortHistory();
  }

  clearFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.exportHistory = [...this.originalExportHistory];
    this.sortHistory();
  }

  filterHistory(): void {
    this.applyFilters();
  }

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

  showExportSuccessAlert(format: string, recordCount: number): void {
    if (!this.Swal) return;

    this.Swal.fire({
      icon: 'success',
      title: 'ส่งออกข้อมูลสำเร็จ!',
      html: `
        <div style="text-align: center; padding: 10px;">
          <p style="font-size: 16px; color: #666;">ส่งออกไฟล์ ${format} เรียบร้อยแล้ว</p>
          <p style="font-size: 14px; color: #999;">จำนวนข้อมูล: ${recordCount} รายการ</p>
        </div>
      `,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#4CAF50',
      timer: 3000,
      timerProgressBar: true
    });
  }

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