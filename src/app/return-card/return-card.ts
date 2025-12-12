import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { VisitorService, RFIDCardResponse, ReturnCardHistoryResponse } from '../services/visitor.service';

@Component({
  selector: 'app-return-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-card.html',
  styleUrls: ['./return-card.css']
})
export class ReturnCardComponent implements OnInit {
  
  searchInput: string = '';
  activeCard: RFIDCardResponse | null = null;
  historyList: ReturnCardHistoryResponse[] = [];
  historyListOriginal: ReturnCardHistoryResponse[] = [];

  // Filter states
  filterText: string = "";
  startDate: string = "";
  endDate: string = "";
  showDatePicker = false;
  showSort = false;
  sortMode: 'asc' | 'desc' | '' = '';

  // Loading states
  isSearching = false;
  isReturning = false;
  isLoadingHistory = false;

  constructor(private visitorService: VisitorService) {}

  ngOnInit() {
    console.log('🔄 Component initialized, loading history...');
    this.loadReturnHistory();
  }

  // ค้นหาบัตร RFID
  onSearch() {
    if (!this.searchInput.trim()) {
      Swal.fire({
        title: 'กรุณาสแกนบัตร',
        text: 'กรุณาสแกนหรือพิมพ์รหัสบัตร RFID',
        icon: 'warning',
        confirmButtonColor: '#4CAF50'
      });
      return;
    }

    this.isSearching = true;
    console.log('🔍 Searching for RFID:', this.searchInput.trim());

    this.visitorService.searchByRFID(this.searchInput.trim()).subscribe({
      next: (response) => {
        console.log('✅ Found card:', response);
        this.activeCard = response;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('❌ Search error:', error);
        this.isSearching = false;
        Swal.fire({
          title: 'ไม่พบข้อมูล',
          text: 'ไม่พบข้อมูลบัตร RFID นี้ในระบบ',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
        this.activeCard = null;
      }
    });
  }

  // ยืนยันการคืนบัตร
  confirmReturnCard() {
    if (!this.activeCard) return;

    Swal.fire({
      title: 'ยืนยันการคืนบัตร?',
      html: `
        <div style="text-align: left; margin-top: 15px;">
          <p><strong>รหัสบัตร:</strong> ${this.activeCard.id}</p>
          <p><strong>ชื่อ-นามสกุล:</strong> ${this.activeCard.name}</p>
          <p><strong>เวลาเข้า:</strong> ${this.activeCard.checkIn}</p>
          <p><strong>เวลาออก:</strong> ${this.activeCard.checkOut}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยันคืนบัตร',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.onReturnCard();
      }
    });
  }

  // คืนบัตร
  onReturnCard() {
    if (!this.activeCard) return;

    this.isReturning = true;
    const checkOut = new Date().toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    console.log('📤 Returning card:', this.activeCard.id, 'at', checkOut);

    this.visitorService.returnCard(this.activeCard.id, checkOut).subscribe({
      next: (response) => {
        console.log('✅ Card returned successfully:', response);
        this.isReturning = false;
        
        Swal.fire({
          title: 'คืนบัตรสำเร็จ!',
          text: `บัตร ${this.activeCard?.id} ได้ถูกคืนเรียบร้อยแล้ว`,
          icon: 'success',
          confirmButtonColor: '#4CAF50',
          confirmButtonText: 'ตกลง',
          timer: 2000
        });

        // รีเฟรชประวัติ
        this.loadReturnHistory();
        
        // ล้างข้อมูลบัตรที่แสดง
        this.activeCard = null;
        this.searchInput = '';
      },
      error: (error) => {
        console.error('❌ Return error:', error);
        this.isReturning = false;
        
        // ตรวจสอบว่าเป็น error แบบไหน
        const errorMessage = error.error?.error || error.message || 'ไม่สามารถคืนบัตรได้ กรุณาลองใหม่อีกครั้ง';
        
        // ถ้าเป็นบัตรซ้ำ แสดง warning สีส้ม
        if (errorMessage.includes('ถูกคืนไปแล้ว') || errorMessage.includes('ซ้ำ')) {
          Swal.fire({
            title: '⚠️ บัตรซ้ำ!',
            html: `
              <div style="text-align: center; margin-top: 15px;">
                <p style="font-size: 16px; margin-bottom: 10px;">
                  <strong>บัตร ${this.activeCard?.id}</strong> ถูกคืนไปแล้ววันนี้
                </p>
                <p style="color: #666;">ไม่สามารถคืนบัตรซ้ำได้</p>
              </div>
            `,
            icon: 'warning',
            confirmButtonColor: '#ff9800',
            confirmButtonText: 'เข้าใจแล้ว'
          });
        } else {
          // Error อื่นๆ แสดงเป็น error สีแดง
          Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
        
        // ล้างข้อมูลบัตร
        this.activeCard = null;
        this.searchInput = '';
      }
    });
  }

  // โหลดประวัติการคืนบัตร
  loadReturnHistory() {
    this.isLoadingHistory = true;
    console.log('📋 Loading return history...');
    
    this.visitorService.getReturnHistory().subscribe({
      next: (response) => {
        console.log('✅ History loaded:', response);
        console.log('📊 Total records:', response.length);
        
        this.historyList = response;
        this.historyListOriginal = [...response];
        this.isLoadingHistory = false;

        if (response.length === 0) {
          console.warn('⚠️ No return history found in database');
        }
      },
      error: (error) => {
        console.error('❌ History load error:', error);
        console.error('Error details:', error.error);
        this.isLoadingHistory = false;
        
        // แสดง error แต่ไม่รบกวนผู้ใช้
        this.historyList = [];
        this.historyListOriginal = [];
      }
    });
  }

  // Toggle Date Picker
  toggleDatePicker() {
    this.showDatePicker = !this.showDatePicker;
  }

  // Toggle Sort
  toggleSort() {
    this.showSort = !this.showSort;
  }

  // Set Sort Mode
  setSort(mode: 'asc' | 'desc') {
    this.sortMode = mode;
    this.showSort = false;
    this.applyFilters();
  }

  // Apply Filters
  applyFilters() {
    const params: any = {};

    if (this.filterText.trim()) {
      params.search = this.filterText.trim();
    }

    if (this.startDate) {
      params.startDate = this.startDate;
    }

    if (this.endDate) {
      params.endDate = this.endDate;
    }

    if (this.sortMode) {
      params.sortOrder = this.sortMode;
    }

    console.log('🔍 Applying filters:', params);

    this.isLoadingHistory = true;

    this.visitorService.getReturnHistory(params).subscribe({
      next: (response) => {
        console.log('✅ Filtered results:', response.length, 'records');
        this.historyList = response;
        this.isLoadingHistory = false;
      },
      error: (error) => {
        console.error('❌ Filter error:', error);
        this.isLoadingHistory = false;
      }
    });
  }

  // แปลง dd/mm/yyyy → yyyy-mm-dd
  convertToISO(dateStr: string): string {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }
}