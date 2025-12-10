import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router'
import { Router } from '@angular/router';

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
  imports: [CommonModule, 
            FormsModule ,
            MatFormFieldModule,
            MatInputModule, 
            MatDatepickerModule,
            MatNativeDateModule ,
            MatIconModule,
            RouterLink], 
  templateUrl: './datatable.html',
  styleUrls: ['./datatable.css']
})
export class DatatableComponent {

  startDate: Date | null = null;
  endDate: Date | null = null;
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


  viewImage(id: number) {
    alert(`ดูรูปภาพของ ID: ${id}`);
  }
  constructor(private router: Router) {}

  addVisitor() {
    this.router.navigate(['/register']);
  }

}