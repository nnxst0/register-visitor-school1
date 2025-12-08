import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { ReactiveFormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports: [ ReactiveFormsModule ] // ต้อง import ReactiveFormsModule เพื่อใช้ FormBuilder/FormGroup
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the registrationForm with required fields', () => {
    const form = component.registrationForm;
    // ตรวจสอบว่าฟอร์มไม่ถูกต้องเมื่อเริ่มต้น (เพราะยังไม่ได้กรอก)
    expect(form.valid).toBeFalse();
    
    // ตรวจสอบว่า field ที่จำเป็นต้องมี errors['required']
    expect(form.get('idCard')?.hasError('required')).toBeTrue();
    expect(form.get('firstName')?.hasError('required')).toBeTrue();
    expect(form.get('province')?.hasError('required')).toBeTrue();
  });

  it('should show department selection after successful submission', () => {
    // กำหนดค่าที่ถูกต้องให้ฟอร์ม
    component.registrationForm.setValue({
      idCard: '1234567890123',
      firstName: 'ทดสอบ',
      lastName: 'ระบบ',
      birthDate: '2000-01-01',
      phone: '0812345678',
      licensePlate: '',
      houseNumber: '123',
      moo: '',
      soi: '',
      road: '',
      subDistrict: 'ต.ทดสอบ',
      district: 'อ.ทดสอบ',
      province: 'ภูเก็ต',
      rfid: 'R005'
    });

    component.handleSubmit();
    // ตรวจสอบว่า showDepartmentSelection เป็น true
    expect(component.showDepartmentSelection).toBeTrue();
    // ตรวจสอบว่า currentVisitorId ถูกกำหนดค่าแล้ว
    expect(component.currentVisitorId).toBe(component.visitors.length + 1);
  });
});