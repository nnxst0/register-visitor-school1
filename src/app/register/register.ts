import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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

// Interface สำหรับ Backend Response
interface VisitorListResponse {
  id: number;
  idCard: string;
  name: string;
  birthDate: string;
  phone: string;
  address: string;
  rfid: string;
  department: string;
  officerName: string;
  registeredAt: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  // Inject services
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // Form Groups สำหรับจัดการ Input
  registrationForm: FormGroup;
  officerForm: FormGroup;

  // Declare SweetAlert2
  private Swal: any;

  // State
  visitors: Visitor[] = [];

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

  // API URL
  private apiUrl = 'http://localhost:8080/api/visitors';

  constructor() {
    this.registrationForm = this.fb.group({
      idCard: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: [''],
      phone: ['', Validators.required],
      licensePlate: [''],
      houseNumber: [''],
      moo: [''],
      soi: [''],
      road: [''],
      subDistrict: [''],
      district: [''],
      province: [''],
      rfid: ['', Validators.required]
    });

    this.officerForm = this.fb.group({
      officerName: ['']
    });
  }

  ngOnInit(): void {
    this.officerForm.get('officerName')?.setValidators(null);
    this.loadVisitors();
    this.loadSweetAlert();
  }

  // Load SweetAlert2
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
        this.showWarningAlert('กรุณาเลือกไฟล์ JPG หรือ PNG เท่านั้น');
        event.target.value = ''; // Reset input
        return;
      }

      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showWarningAlert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB');
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
  // SweetAlert2 Functions
  // **********************************
  showErrorAlert(message: string): void {
    if (this.Swal) {
      this.Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: message,
        confirmButtonText: 'ตรวจสอบอีกครั้ง',
        confirmButtonColor: '#d33'
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
        confirmButtonColor: '#4CAF50',
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
      this.showErrorAlert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
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
      this.showErrorAlert('กรุณาเลือกส่วนงานที่ต้องการติดต่อ');
      return;
    }

    if (this.showOfficerInput) {
      if (!this.selectedTeacher && !this.customTeacherName && !this.unknownTeacher) {
        this.showErrorAlert('กรุณาเลือกครูที่ต้องการติดต่อ หรือกรอกชื่อครู หรือเลือก "ไม่ทราบชื่อ"');
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

    // ✅ จัดรูปแบบวันเกิด (YYYY-MM-DD → DD/MM/YY) หรือ "-"
    let formattedBirthDate = '-';
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const day = String(birthDate.getDate()).padStart(2, '0');
      const month = String(birthDate.getMonth() + 1).padStart(2, '0');
      const year = String(birthDate.getFullYear() + 543).slice(-2);
      formattedBirthDate = `${day}/${month}/${year}`;
    }

    // ✅ จัดรูปแบบเบอร์โทร (0812345678 → 081-2345678)
    let formattedPhone = formData.phone;
    if (formData.phone && formData.phone.length === 10) {
      formattedPhone = formData.phone.substring(0, 3) + '-' + formData.phone.substring(3);
    }

    // ✅ จัดรูปแบบที่อยู่แบบสวยงาม หรือ "-"
    let addressParts: string[] = [];

    if (formData.houseNumber) {
      addressParts.push(formData.houseNumber);
    }

    if (formData.moo) {
      addressParts.push('ม.' + formData.moo);
    }

    if (formData.soi) {
      addressParts.push('ซ.' + formData.soi);
    }

    if (formData.road) {
      addressParts.push('ถ.' + formData.road);
    }

    if (formData.subDistrict) {
      addressParts.push('ต.' + formData.subDistrict);
    }

    if (formData.district) {
      addressParts.push('อ.' + formData.district);
    }

    if (formData.province) {
      addressParts.push('จ.' + formData.province);
    }

    const formattedAddress = addressParts.length > 0 ? addressParts.join(' ') : '-';
    const shortAddress = addressParts.length > 0 ? addressParts.slice(0, 3).join(' ') + '...' : '-';

    // 🔥 แสดง Confirmation Dialog พร้อมรายละเอียดข้อมูล
    this.showConfirmationDialog({
      idCard: formData.idCard,
      name: `${formData.firstName} ${formData.lastName}`,
      birthDate: formattedBirthDate,
      phone: formattedPhone,
      address: formattedAddress,
      rfid: formData.rfid,
      department: this.selectedDepartment,
      officer: officerName,
      registeredAt: registeredAt
    }, shortAddress);
  }

  // ฟังก์ชันแสดง Confirmation Dialog
  showConfirmationDialog(data: any, shortAddress: string): void {
    if (!this.Swal) {
      alert('กำลังโหลด SweetAlert2...');
      return;
    }

    const htmlContent = `
      <div style="text-align: left; padding: 10px;">
        <div style="margin-bottom: 15px;">
          <strong style="color: #2E50BC;">ข้อมูลผู้มาติดต่อ</strong>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>เลขบัตรประชาชน:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.idCard}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>ชื่อ-สกุล:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>วันเกิด:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.birthDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>เบอร์โทร:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>ที่อยู่:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.address}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>RFID:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.rfid}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>ส่วนงาน:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.department}</td>
          </tr>
          ${data.officer ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>ติดต่อ:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.officer}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px;"><strong>วันที่ลงทะเบียน:</strong></td>
            <td style="padding: 8px;">${data.registeredAt}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 10px; background-color: #FFF3CD; border-radius: 8px; border-left: 4px solid #FBB903;">
          <strong>⚠️ โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน</strong>
        </div>
      </div>
    `;

    this.Swal.fire({
      title: 'ยืนยันการบันทึกข้อมูล',
      html: htmlContent,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      width: '600px',
      customClass: {
        popup: 'swal-wide'
      }
    }).then((result: any) => {
      if (result.isConfirmed) {
        // บันทึกข้อมูลจริง
        this.saveVisitorData(data, shortAddress);
      }
    });
  }

  // ฟังก์ชันบันทึกข้อมูลจริง - ส่งไปยัง Backend
  saveVisitorData(data: any, shortAddress: string): void {
    const formData = this.registrationForm.value;

    // เตรียมข้อมูลสำหรับส่งไป Backend
    const visitorData = {
      idCard: formData.idCard,
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.birthDate || null,
      phone: formData.phone,
      licensePlate: formData.licensePlate || '',
      houseNumber: formData.houseNumber || '',
      moo: formData.moo || '',
      soi: formData.soi || '',
      road: formData.road || '',
      subDistrict: formData.subDistrict || '',
      district: formData.district || '',
      province: formData.province || '',
      rfid: formData.rfid,
      department: data.department || '',
      officerName: data.officer || '',
      idCardImage: this.idCardImage || ''
    };

    // ส่งข้อมูลไปยัง Backend
    this.http.post(this.apiUrl, visitorData).subscribe({
      next: (response: any) => {
        console.log('บันทึกสำเร็จ:', response);

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

        // โหลดข้อมูลใหม่จาก Backend
        this.loadVisitors();

        // แสดง success alert
        this.showSuccessAlert('บันทึกข้อมูลสำเร็จ!', 'ข้อมูลผู้มาติดต่อถูกบันทึกเรียบร้อยแล้ว');

        setTimeout(() => {
          this.initThailandJS();
        }, 100);

        setTimeout(() => {
          const element = document.querySelector('[data-section="visitor-list"]');
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาด:', error);
        
        let errorMessage = 'ไม่สามารถบันทึกข้อมูลได้';
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.showErrorAlert(errorMessage);
      }
    });
  }

  // **********************************
  // ฟังก์ชันโหลดข้อมูลจาก Backend
  // **********************************
  loadVisitors(): void {
    const params: any = {
      sortOrder: this.sortOrder
    };

    if (this.searchText) {
      params.search = this.searchText;
    }
    if (this.startDate) {
      params.startDate = this.startDate;
    }
    if (this.endDate) {
      params.endDate = this.endDate;
    }

    // สร้าง query string
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = `${this.apiUrl}?${queryString}`;

    this.http.get<VisitorListResponse[]>(url).subscribe({
      next: (response) => {
        // แปลง response จาก Backend เป็น Visitor interface
        this.filteredVisitors = response.map(v => ({
          id: v.id,
          idCard: v.idCard,
          name: v.name,
          birthDate: v.birthDate,
          phone: v.phone,
          address: v.address,
          rfid: v.rfid,
          registeredAt: v.registeredAt,
          department: v.department,
          officer: v.officerName
        }));
        
        // อัพเดท visitors array ด้วย
        this.visitors = this.filteredVisitors;
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
        this.filteredVisitors = [];
      }
    });
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
    this.loadVisitors();
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