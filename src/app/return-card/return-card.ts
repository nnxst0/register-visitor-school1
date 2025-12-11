import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface RfidCard {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
}

interface HistoryLog {
  no: number;
  cardId: string;
  name: string;
  timeIn: string;
  timeOut: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-return-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-card.html',
  styleUrls: ['./return-card.css']
})
export class ReturnCardComponent {
  
  searchInput: string = '';
  activeCard: any;

  // Mock Data: ฐานข้อมูลจำลอง
  mockDatabase: RfidCard[] = [
    { id: 'RF1001', name: 'สีฟ้า ใจดี', checkIn: '09:11', checkOut: '10:55' },
    { id: 'RF1002', name: 'ธนัญญา วันเสน', checkIn: '08:30', checkOut: '09:41' },
    { id: 'RF1003', name: 'สมชาย รักเรียน', checkIn: '07:50', checkOut: '16:00' }
  ];

  // Mock Data: ประวัติเริ่มต้น
  historyList: HistoryLog[] = [
    { no: 1, cardId: 'RF1001', name: 'วิลาสินี ศิริชุม', timeIn: '09:11', timeOut: '10:55', date: '08/09/2025', status: 'การคืนบัตรสำเร็จ' },
    { no: 2, cardId: 'RF1002', name: 'ธนัญญา วันเสน', timeIn: '08:30', timeOut: '09:41', date: '04/09/2025', status: 'การคืนบัตรสำเร็จ' }
  ];

  onSearch() {
    if (!this.searchInput) return;
    const found = this.mockDatabase.find(c => c.id.toLowerCase() === this.searchInput.toLowerCase());
    
    if (found) {
      this.activeCard = found;
    } else {
      alert('ไม่พบข้อมูลบัตร RFID นี้ (ลองใส่ RF1001 หรือ RF1002)');
      this.activeCard = null;
    }
  }

  onReturnCard() {
    if (!this.activeCard) return;

    const newLog: HistoryLog = {
      no: this.historyList.length + 1,
      cardId: this.activeCard.id,
      name: this.activeCard.name,
      timeIn: this.activeCard.checkIn,
      timeOut: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      status: 'การคืนบัตรสำเร็จ'
    };

    this.historyList.unshift(newLog); // เพิ่มรายการใหม่ไว้บนสุด
  
  }
  confirmReturnCard() {
    Swal.fire({
      title: 'ยืนยันการคืนบัตร?',
      html: `
        <div style="text-align: left; margin-top: 15px;">
          <p><strong>รหัสบัตร:</strong> ${this.activeCard?.id}</p>
          <p><strong>ชื่อ-นามสกุล:</strong> ${this.activeCard?.name}</p>
          <p><strong>เวลาเข้า:</strong> ${this.activeCard?.checkIn}</p>
          <p><strong>เวลาออก:</strong> ${this.activeCard?.checkOut}</p>
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
        Swal.fire({
          title: 'คืนบัตรสำเร็จ!',
          text: `บัตร ${this.activeCard?.id} ได้ถูกคืนเรียบร้อยแล้ว`,
          icon: 'success',
          confirmButtonColor: '#4CAF50',
          confirmButtonText: 'ตกลง',
          timer: 2000
        });
      }
    });
  }


  filterText: string = "";
startDate: string = "";
endDate: string = "";
showDatePicker = false;

showSort = false;
sortMode: 'asc' | 'desc' | '' = '';

historyListOriginal = [...this.historyList]; // สำเนาข้อมูลจริง

toggleDatePicker() {
  this.showDatePicker = !this.showDatePicker;
}

toggleSort() {
  this.showSort = !this.showSort;
}

setSort(mode: 'asc' | 'desc') {
  this.sortMode = mode;
  this.showSort = false;
  this.applyFilters();
}

applyFilters() {
  let data = [...this.historyListOriginal];

  // 🔍 search filter
  if (this.filterText.trim() !== "") {
    data = data.filter(item =>
      item.cardId.toLowerCase().includes(this.filterText.toLowerCase()) ||
      item.name.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  // 📅 date filter
// 📅 date filter (convert ก่อนเทียบ)
if (this.startDate) {
  data = data.filter(item => 
    this.convertToISO(item.date) >= this.startDate
  );
}

if (this.endDate) {
  data = data.filter(item => 
    this.convertToISO(item.date) <= this.endDate
  );
}


  // 🔽 sort
  if (this.sortMode === "asc") {
    data = data.sort((a, b) => a.timeIn.localeCompare(b.timeIn));
  }
  if (this.sortMode === "desc") {
    data = data.sort((a, b) => b.timeIn.localeCompare(a.timeIn));
  }

  this.historyList = data;
}

// แปลง dd/mm/yyyy → yyyy-mm-dd
convertToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

}