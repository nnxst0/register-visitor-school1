import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { VisitorService, VisitorListResponse, Visitor as VisitorData } from '../services/visitor.service';

interface Visitor {
  id: number;
  name: string;
  date: string; 
  timeIn: string;
  timeOut: string;
  department: string;
  hasImage: boolean;
  status: string;
}

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    RouterLink
  ], 
  templateUrl: './datatable.html',
  styleUrls: ['./datatable.css']
})
export class DatatableComponent implements OnInit {
  // Date filter
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Data
  visitors = signal<Visitor[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Image modal - ประกาศทุกตัวแปรที่จำเป็น
  showImageModal = signal<boolean>(false);
  selectedVisitorId = signal<number | null>(null);
  visitorImage = signal<string | null>(null);
  isLoadingImage = signal<boolean>(false);
  imageError = signal<string | null>(null);

  constructor(
    private router: Router,
    private visitorService: VisitorService
  ) {}

  ngOnInit() {
    this.loadVisitors();
  }

  loadVisitors() {
    this.isLoading.set(true);
    this.error.set(null);

    const params: any = {
      sortOrder: 'latest'
    };

    if (this.startDate) {
      params.startDate = this.formatDateForAPI(this.startDate);
    }
    if (this.endDate) {
      params.endDate = this.formatDateForAPI(this.endDate);
    }

    this.visitorService.getVisitors(params).subscribe({
      next: (response: VisitorListResponse[]) => {
        console.log('Received data:', response);
        const visitors = this.transformToVisitors(response);
        this.visitors.set(visitors);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading visitors:', err);
        this.error.set('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
        this.isLoading.set(false);
      }
    });
  }

  transformToVisitors(apiData: VisitorListResponse[]): Visitor[] {
    return apiData.map(item => ({
      id: item.id,
      name: item.name,
      date: this.formatThaiDate(item.registeredAt),
      timeIn: this.extractTime(item.registeredAt),
      timeOut: '-',
      department: this.formatDepartment(item.department, item.officerName),
      hasImage: true,
      status: 'เสร็จสิ้น'
    }));
  }

  formatThaiDate(dateString: string): string {
    const date = new Date(dateString);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    
    return `${day} ${month} ${year}`;
  }

  extractTime(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDepartment(department: string, officerName: string): string {
    if (department && officerName) {
      return `${department}/${officerName}`;
    } else if (department) {
      return department;
    } else if (officerName) {
      return officerName;
    }
    return '-';
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateRangeChange() {
    if (this.startDate || this.endDate) {
      this.loadVisitors();
    }
  }

  clearDateFilter() {
    this.startDate = null;
    this.endDate = null;
    this.loadVisitors();
  }

  viewImage(id: number) {
    this.selectedVisitorId.set(id);
    this.showImageModal.set(true);
    this.isLoadingImage.set(true);
    this.imageError.set(null);
    this.visitorImage.set(null);

    this.visitorService.getVisitorById(id).subscribe({
      next: (visitor: VisitorData) => {
        this.isLoadingImage.set(false);
        
        if (visitor.idCardImage) {
          if (visitor.idCardImage.startsWith('data:image')) {
            this.visitorImage.set(visitor.idCardImage);
          } 
          else if (visitor.idCardImage.startsWith('http')) {
            this.visitorImage.set(visitor.idCardImage);
          }
          else {
            this.visitorImage.set(`data:image/jpeg;base64,${visitor.idCardImage}`);
          }
        } else {
          this.imageError.set('ไม่พบรูปภาพบัตรประชาชน');
        }
      },
      error: (err) => {
        console.error('Error loading visitor image:', err);
        this.isLoadingImage.set(false);
        this.imageError.set('เกิดข้อผิดพลาดในการโหลดรูปภาพ');
      }
    });
  }

  closeImageModal() {
    this.showImageModal.set(false);
    this.selectedVisitorId.set(null);
    this.visitorImage.set(null);
    this.imageError.set(null);
  }

  addVisitor() {
    this.router.navigate(['/register']);
  }
}