import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// ประกาศ jQuery และ Thailand.js สำหรับ TypeScript
declare var $: any;

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
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  // Form Groups สำหรับจัดการ Input
  registrationForm: FormGroup;
  officerForm: FormGroup;

  // State
  visitors: Visitor[] = [
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

  // ตัวเลือกสำหรับครู
  selectedTeachers: string[] = [];
  selectedTeacher: string = '';
  customTeacherName: string = '';
  unknownTeacher: boolean = false;

  departments: string[] = [
    'สำนักงานผู้อำนวยการ',
    'กลุ่มบริหารงานบุคคล',
    'กลุ่มบริหารวิชาการ',
    'กลุ่มบริหารทั่วไป',
    'กลุ่มบริหารงบประมาน',
    'ติดต่อ ข้าราชการครู',
    'นักพัฒนา',
    'พ่อค้า และ แม่ค้า',
    'ร้านค้าสหกรณ์โรงเรียน'
  ];

  // รายชื่อครู
  teacherList: string[] = [
    'นายธนากร แก้วมณี',
    'นายฐาปนา วินิคม',
    'นางสาวพรศรี มาลาขวัญ',
    'นางสาววิภาดา สุขใจ',
    'นายสมชาย ดีเลิศ'
  ];

  // ตัวแปรสำหรับค้นหาและกรอง
  searchText: string = '';
  startDate: string = '';
  endDate: string = '';
  sortOrder: 'latest' | 'oldest' = 'latest';
  filteredVisitors: Visitor[] = [];
  showDatePicker: boolean = false;

  // ตัวแปรสำหรับเก็บรูปภาพบัตรประชาชน
  idCardImage: string | null = null;

  constructor(private fb: FormBuilder) {
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

    this.officerForm = this.fb.group({
      officerName: ['']
    });
  }

  ngOnInit(): void {
    this.officerForm.get('officerName')?.setValidators(null);
    this.filterAndSortVisitors();
  }

  ngAfterViewInit(): void {
    this.initThailandJS();
  }

  // **********************************
  // ฟังก์ชันจัดการรูปภาพ
  // **********************************
  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // ตรวจสอบประเภทไฟล์
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('กรุณาเลือกไฟล์ JPG หรือ PNG เท่านั้น');
        event.target.value = ''; // Reset input
        return;
      }

      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB');
        event.target.value = ''; // Reset input
        return;
      }

      // อ่านไฟล์และแปลงเป็น Base64
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.idCardImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ฟังก์ชันลบรูป
  removeImage(event: Event): void {
    event.stopPropagation(); // ป้องกันไม่ให้เปิด file dialog
    this.idCardImage = null;
  }

  // **********************************
  // ฟังก์ชันเริ่มต้น Thailand.js
  // **********************************
  initThailandJS(): void {
    if (typeof $ !== 'undefined' && $.Thailand) {
      $.Thailand({
        $district: $('#subDistrict'),
        $amphoe: $('#district'),
        $province: $('#province'),
        onDataFill: (data: any) => {
          this.registrationForm.patchValue({
            subDistrict: data.district,
            district: data.amphoe,
            province: data.province
          });
        }
      });
    }
  }

  // **********************************
  // Logic การบันทึกข้อมูลส่วนตัว (Step 1)
  // **********************************
  handleSubmit(): void {
    if (this.registrationForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.currentVisitorId = this.visitors.length + 1;
    this.showDepartmentSelection = true;

    setTimeout(() => {
      const element = document.querySelector('[data-section="department"]');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // **********************************
  // Logic การเลือกส่วนงาน (Step 2)
  // **********************************
  handleDepartmentSelect(dept: string): void {
    this.selectedDepartment = dept;
    this.showOfficerInput = dept === 'ติดต่อ ข้าราชการครู';

    // Reset ค่าเมื่อเปลี่ยนส่วนงาน
    this.selectedTeacher = '';
    this.customTeacherName = '';
    this.unknownTeacher = false;

    if (!this.showOfficerInput) {
      this.officerForm.get('officerName')?.setValidators(null);
      this.officerForm.patchValue({ officerName: '' });
      this.officerForm.get('officerName')?.updateValueAndValidity();
    }
  }

  // เลือกครูจากรายชื่อ
  selectTeacher(teacher: string): void {
    this.selectedTeacher = teacher;
    this.customTeacherName = '';
    this.unknownTeacher = false;
  }

  handleSaveDepartment(): void {
    if (!this.selectedDepartment) {
      alert('กรุณาเลือกส่วนงานที่ต้องการติดต่อ');
      return;
    }

    if (this.showOfficerInput) {
      if (!this.selectedTeacher && !this.customTeacherName && !this.unknownTeacher) {
        alert('กรุณาเลือกครูที่ต้องการติดต่อ หรือกรอกชื่อครู หรือเลือก "ไม่ทราบชื่อ"');
        return;
      }
    }

    const now = new Date();
    const registeredAt = now.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    let officerName: string | null = null;
    if (this.selectedTeacher) {
      officerName = this.selectedTeacher;
    } else if (this.customTeacherName) {
      officerName = this.customTeacherName;
    } else if (this.unknownTeacher) {
      officerName = 'ไม่ทราบชื่อ';
    }

    const formData = this.registrationForm.value;

    // ✅ จัดรูปแบบวันเกิด (YYYY-MM-DD → DD/MM/YY)
    let formattedBirthDate = '';
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const day = String(birthDate.getDate()).padStart(2, '0');
      const month = String(birthDate.getMonth() + 1).padStart(2, '0');
      const year = String(birthDate.getFullYear() + 543).slice(-2); // แปลงเป็น พ.ศ. 2 หลัก
      formattedBirthDate = `${day}/${month}/${year}`;
    }

    // ✅ จัดรูปแบบเบอร์โทร (0812345678 → 081-2345678)
    let formattedPhone = formData.phone;
    if (formData.phone && formData.phone.length === 10) {
      formattedPhone = formData.phone.substring(0, 3) + '-' + formData.phone.substring(3);
    }

    // ✅ จัดรูปแบบที่อยู่แบบสวยงาม
    let addressParts: string[] = [];

    // บ้านเลขที่
    if (formData.houseNumber) {
      addressParts.push(formData.houseNumber);
    }

    // หมู่
    if (formData.moo) {
      addressParts.push('ม.' + formData.moo);
    }

    // ซอย
    if (formData.soi) {
      addressParts.push('ซ.' + formData.soi);
    }

    // ถนน
    if (formData.road) {
      addressParts.push('ถ.' + formData.road);
    }

    // ตำบล
    if (formData.subDistrict) {
      addressParts.push('ต.' + formData.subDistrict);
    }

    const formattedAddress = addressParts.join(' ') + '...';

    const newVisitor: Visitor = {
      id: this.currentVisitorId!,
      idCard: formData.idCard,
      name: `${formData.firstName} ${formData.lastName}`,
      birthDate: formattedBirthDate, // ใช้รูปแบบใหม่
      phone: formattedPhone, // ใช้รูปแบบใหม่
      address: formattedAddress, // ใช้รูปแบบใหม่
      rfid: formData.rfid,
      registeredAt: registeredAt,
      department: this.selectedDepartment,
      officer: officerName
    };

    this.visitors = [newVisitor, ...this.visitors];

    // Reset ทุกอย่างรวมถึงรูปภาพ
    this.idCardImage = null;
    this.registrationForm.reset();
    this.officerForm.reset();
    this.registrationForm.get('province')?.setValue('');
    this.showDepartmentSelection = false;
    this.selectedDepartment = '';
    this.showOfficerInput = false;
    this.currentVisitorId = null;
    this.selectedTeacher = '';
    this.customTeacherName = '';
    this.unknownTeacher = false;

    this.filterAndSortVisitors();

    setTimeout(() => {
      this.initThailandJS();
    }, 100);

    setTimeout(() => {
      const element = document.querySelector('[data-section="visitor-list"]');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // **********************************
  // Utility Function
  // **********************************
  getCurrentVisitorMessage(): string {
    const now = new Date();
    const thaiDate = now.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `ผู้มาติดต่อที่ ${this.currentVisitorId} วันที่ ${thaiDate} เวลาเข้ามาติดต่อ รปภ. ${time} น.`;
  }

  // **********************************
  // ฟังก์ชันค้นหาและกรอง
  // **********************************
  filterAndSortVisitors(): void {
    let filtered = [...this.visitors];

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchLower) ||
        v.idCard.includes(searchLower)
      );
    }

    if (this.startDate || this.endDate) {
      filtered = filtered.filter(v => {
        const visitorDate = this.parseThaiDate(v.registeredAt);
        if (!visitorDate) return true;

        if (this.startDate && this.endDate) {
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          return visitorDate >= start && visitorDate <= end;
        } else if (this.startDate) {
          const start = new Date(this.startDate);
          return visitorDate >= start;
        } else if (this.endDate) {
          const end = new Date(this.endDate);
          return visitorDate <= end;
        }
        return true;
      });
    }

    filtered.sort((a, b) => {
      const dateA = this.parseThaiDate(a.registeredAt);
      const dateB = this.parseThaiDate(b.registeredAt);

      if (!dateA || !dateB) return 0;

      if (this.sortOrder === 'latest') {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });

    this.filteredVisitors = filtered;
  }

  parseThaiDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.split(' ');
      if (parts.length < 2) return null;

      const datePart = parts[0].split('/');
      const timePart = parts[1].split(':');

      if (datePart.length < 3 || timePart.length < 3) return null;

      const day = parseInt(datePart[0]);
      const month = parseInt(datePart[1]) - 1;
      const year = parseInt(datePart[2]) - 543;
      const hour = parseInt(timePart[0]);
      const minute = parseInt(timePart[1]);
      const second = parseInt(timePart[2]);

      return new Date(year, month, day, hour, minute, second);
    } catch (e) {
      return null;
    }
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'latest' ? 'oldest' : 'latest';
    this.filterAndSortVisitors();
  }

  toggleDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
  }

  closeDatePicker(): void {
    this.showDatePicker = false;
  }

  applyDateFilter(): void {
    this.filterAndSortVisitors();
    this.closeDatePicker();
  }

  clearDateFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.filterAndSortVisitors();
    this.closeDatePicker();
  }

  clearFilters(): void {
    this.searchText = '';
    this.startDate = '';
    this.endDate = '';
    this.filterAndSortVisitors();
  }
}