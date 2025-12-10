import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  activeCard: RfidCard | null = null;

  // Mock Data: ฐานข้อมูลจำลอง
  mockDatabase: RfidCard[] = [
    { id: 'RF1001', name: 'สีฟ้า ใจดี', checkIn: '09:11', checkOut: '10:55' },
    { id: 'RF1002', name: 'ธนัญญา วันเสน', checkIn: '08:30', checkOut: '09:41' },
    { id: 'RF1003', name: 'สมชาย รักเรียน', checkIn: '07:50', checkOut: '16:00' }
  ];

  // Mock Data: ประวัติเริ่มต้น
  historyList: HistoryLog[] = [
    { no: 1, cardId: 'RF1001', name: 'วิลาสินี ศิริชุม', timeIn: '09:11', timeOut: '10:55', date: '08/09/2568', status: 'การคืนบัตรสำเร็จ' },
    { no: 2, cardId: 'RF1002', name: 'ธนัญญา วันเสน', timeIn: '08:30', timeOut: '09:41', date: '04/09/2568', status: 'การคืนบัตรสำเร็จ' }
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
    
    // เรียงลำดับเลขที่ใหม่ (ถ้าต้องการให้เลข 1 อยู่บนสุดเสมอ)
    // this.historyList.forEach((item, index) => item.no = this.historyList.length - index);

    alert(`คืนบัตร ${this.activeCard.id} เรียบร้อยแล้ว`);
    this.activeCard = null;
    this.searchInput = '';
  }
}