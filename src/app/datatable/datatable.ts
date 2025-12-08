import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


// สร้าง Interface สำหรับข้อมูล (Type Safety)
interface Visitor {
  id: number;
  name: string;
  date: string; // ในโปรเจกต์จริงอาจใช้ Date object
  timeIn: string;
  timeOut: string;
  department: string;
  hasImage: boolean;
  status: string;
}

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [CommonModule, FormsModule , MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule], // Import module ที่จำเป็น
  templateUrl: './datatable.html',
  styleUrls: ['./datatable.css']
})
export class DatatableComponent {

  startDate: Date | null = null;
  endDate: Date | null = null;
  // จำลองข้อมูลตามรูปภาพ (Mock Data)
  // ใช้ Signal สำหรับ State Management แบบใหม่
  visitors = signal<Visitor[]>([
    {
      id: 1,
      name: 'วิลาสินี ศิริชุม',
      date: '10 มีนาคม 2565',
      timeIn: '10:24',
      timeOut: '14:22',
      department: 'สำนักงานผู้อำนวยการ',
      hasImage: true,
      status: 'เสร็จสิ้น'
    },
    {
      id: 2,
      name: 'จณิสตา เจ๊ะยะหลี',
      date: '11 มีนาคม 2565',
      timeIn: '10:24',
      timeOut: '14:22',
      department: 'สำนักงานผู้อำนวยการ',
      hasImage: true,
      status: 'เสร็จสิ้น'
    },
    {
      id: 3,
      name: 'ธนัญญา วันเสน',
      date: '12 มีนาคม 2565',
      timeIn: '10:24',
      timeOut: '14:22',
      department: 'ติดต่อข้าราชการครู/นายธนฤติ แก้วกาบิน',
      hasImage: true,
      status: 'เสร็จสิ้น'
    },
    {
      id: 4,
      name: 'สิราวรรณ ใจห้าว',
      date: '13 มีนาคม 2565',
      timeIn: '10:24',
      timeOut: '14:22',
      department: 'กลุ่มบริหารงานบุคคล',
      hasImage: true,
      status: 'เสร็จสิ้น'
    }
  ]);

  // ตัวแปรสำหรับ Date Filter (Mock

  addVisitor() {
    alert('ฟังก์ชันเพิ่มผู้มาติดต่อ');
  }

  viewImage(id: number) {
    alert(`ดูรูปภาพของ ID: ${id}`);
  }
}