import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Interface สำหรับข้อมูลผู้มาติดต่อที่บันทึกแล้ว
interface Visitor {
  id: number;
  idCard: string;
  name: string;
  birthDate: string;
  phone: string;
  address: string;
  rfid: string;
  registeredAt: string;
  department: string | null;
  officer: string | null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  // Form Groups สำหรับจัดการ Input
  registrationForm: FormGroup;
  officerForm: FormGroup;

  // State
  visitors: Visitor[] = [
    // ข้อมูลเริ่มต้นตามที่คุณให้มา
    {
      id: 1,
      idCard: '1809927945130',
      name: 'วิจิตร ศรีอยู',
      birthDate: '18/05/46',
      phone: '084-3574982',
      address: '84/2 ถ.นางหงษ์ ต.ม...',
      rfid: 'R001',
      registeredAt: '08/09/2568 14:14:52',
      department: null,
      officer: null
    },
    {
      id: 2,
      idCard: '1809924972891',
      name: 'สมบุญ วินิยมา',
      birthDate: '22/10/46',
      phone: '093-7849104',
      address: '857 ถ.นิงลัง ต.มีบอ...',
      rfid: 'R002',
      registeredAt: '08/09/2568 15:20:57',
      department: null,
      officer: null
    }
  ];
  
  showDepartmentSelection: boolean = false;
  currentVisitorId: number | null = null;
  selectedDepartment: string = '';
  showOfficerInput: boolean = false;

  departments: string[] = [
    'สำนักงานผู้อำนวยการ',
    'กลุ่มบริหารงานบุคคล',
    'กลุ่มบริหารวิชาการ',
    'กลุ่มบริหารทั่วไป',
    'กลุ่มบริหารงบประมาน',
    'ติดต่อ ข้าราชการครู',
    'นักเรียนนา', // แก้ไขตามรูปภาพ: 'นักเรียน'
    'ฟอร์ม และ แผ่นคำ', // แก้ไขตามรูปภาพ: 'พ่อค้า และ แม่ค้า'
    'ร้านค้าสหกรณ์โรงเรียน'
  ];

  // อ้างอิงถึง FormBuilder ใน Constructor
  constructor(private fb: FormBuilder) {
    // สร้าง Form Group สำหรับข้อมูลผู้มาติดต่อ
    this.registrationForm = this.fb.group({
      idCard: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      phone: ['', Validators.required],
      licensePlate: [''],
      houseNumber: ['', Validators.required],
      moo: [''],
      soi: [''],
      road: [''],
      subDistrict: ['', Validators.required],
      district: ['', Validators.required],
      province: ['', Validators.required],
      rfid: ['', Validators.required]
    });

    // สร้าง Form Group สำหรับชื่อข้าราชการที่ติดต่อ
    this.officerForm = this.fb.group({
      officerName: ['']
    });
  }

  ngOnInit(): void {
    // กำหนด initial state ของ Officer Input
    this.officerForm.get('officerName')?.setValidators(null);
  }

  // **********************************
  // 1. Logic การบันทึกข้อมูลส่วนตัว (Step 1)
  // **********************************
  handleSubmit(): void {
    if (this.registrationForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      this.registrationForm.markAllAsTouched(); // แสดง error message ทั้งหมด
      return;
    }

    // กำหนด ID ผู้มาติดต่อคนปัจจุบัน และแสดงส่วนเลือกส่วนงาน
    this.currentVisitorId = this.visitors.length + 1;
    this.showDepartmentSelection = true;
    
    // เลื่อนหน้าจอไปที่ส่วนเลือกส่วนงาน
    setTimeout(() => {
      document.getElementById('department-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // **********************************
  // 2. Logic การเลือกส่วนงาน (Step 2)
  // **********************************
  handleDepartmentSelect(dept: string): void {
    this.selectedDepartment = dept;
    this.showOfficerInput = dept === 'ติดต่อ ข้าราชการครู';

    // ถ้าเลือก 'ติดต่อ ข้าราชการครู' ต้องกรอกชื่อ จึงกำหนด Validators
    if (this.showOfficerInput) {
      this.officerForm.get('officerName')?.setValidators(Validators.required);
    } else {
      // ถ้าไม่ได้เลือก ให้ลบ Validators และค่าออก
      this.officerForm.get('officerName')?.setValidators(null);
      this.officerForm.patchValue({ officerName: '' });
    }
    this.officerForm.get('officerName')?.updateValueAndValidity();
  }

  handleSaveDepartment(): void {
    if (!this.selectedDepartment) {
      alert('กรุณาเลือกส่วนงานที่ต้องการติดต่อ');
      return;
    }
    
    // ตรวจสอบชื่อข้าราชการถ้ามีการเลือก 'ติดต่อ ข้าราชการครู'
    if (this.showOfficerInput && this.officerForm.invalid) {
      alert('กรุณากรอกชื่อข้าราชการที่ต้องการติดต่อ');
      this.officerForm.markAllAsTouched();
      return;
    }

    const now = new Date();
    // แปลงวันที่เป็นรูปแบบ 'DD/MM/YYYY HH:mm:ss'
    const registeredAt = now.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(' ', ''); // ลบช่องว่างที่อาจมีจากการแปลง (เช่น '08/09/2568, 14:14:52' -> '08/09/256814:14:52')

    const formData = this.registrationForm.value;
    const newVisitor: Visitor = {
      id: this.currentVisitorId!,
      idCard: formData.idCard,
      name: `${formData.firstName} ${formData.lastName}`,
      birthDate: formData.birthDate,
      phone: formData.phone,
      address: `${formData.houseNumber}${formData.moo ? ' ม.' + formData.moo : ''}${formData.soi ? ' ซ.' + formData.soi : ''} ${formData.subDistrict}...`,
      rfid: formData.rfid,
      registeredAt: registeredAt,
      department: this.selectedDepartment,
      officer: this.showOfficerInput ? this.officerForm.get('officerName')?.value : null
    };

    // เพิ่มผู้มาติดต่อใหม่ที่ด้านหน้าของ Array
    this.visitors = [newVisitor, ...this.visitors];
    
    // Reset State และ Form
    this.registrationForm.reset();
    this.officerForm.reset();
    this.registrationForm.get('province')?.setValue(''); // กำหนดค่าว่างให้ select
    this.showDepartmentSelection = false;
    this.selectedDepartment = '';
    this.showOfficerInput = false;
    this.currentVisitorId = null;
    
    // เลื่อนหน้าจอไปที่ส่วนรายการผู้มาติดต่อ
    setTimeout(() => {
      document.getElementById('visitor-list-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // **********************************
  // 3. Utility Function
  // **********************************
  getCurrentVisitorMessage(): string {
    const now = new Date();
    // แปลงวันที่ให้เป็นรูปแบบไทย
    const thaiDate = now.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric' // ปี พ.ศ.
    });
    const time = now.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24-hour format
    });

    // ใช้ this.currentVisitorId ที่ถูกกำหนดค่าแล้ว
    return `ผู้มาติดต่อที่ ${this.currentVisitorId} วันที่ ${thaiDate} เวลาเข้ามาติดต่อ รปภ. ${time} น.`;
  }
}