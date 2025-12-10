import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportComponent } from './export';
import { FormsModule } from '@angular/forms';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportComponent] // เปลี่ยนจาก declarations เป็น imports สำหรับ standalone component
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form values', () => {
    expect(component.selectedDepartment).toBe('ทั้งหมด');
    expect(component.startDate).toBeTruthy(); // เช็คว่ามีค่า
    expect(component.endDate).toBeTruthy();
    expect(component.selectedFormat).toBe('CSV');
  });

  it('should initialize with today date', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const expectedDate = `${year}-${month}-${day}`;

    expect(component.startDate).toBe(expectedDate);
    expect(component.endDate).toBe(expectedDate);
  });

  it('should select format correctly', () => {
    component.selectFormat('Excel');
    expect(component.selectedFormat).toBe('Excel');

    component.selectFormat('JSON');
    expect(component.selectedFormat).toBe('JSON');
  });

  it('should have initial export history records', () => {
    expect(component.originalExportHistory.length).toBe(3);
    expect(component.exportHistory.length).toBe(3);
    expect(component.exportHistory[0].department).toBe('ทั้งหมด');
    expect(component.exportHistory[0].status).toBe('เสร็จสิ้น');
  });

  it('should add new record when exporting data', () => {
    spyOn(window, 'alert');
    const initialLength = component.exportHistory.length;
    
    component.exportData();
    
    expect(component.exportHistory.length).toBeGreaterThanOrEqual(initialLength);
    expect(component.exportHistory[0].status).toBe('เสร็จสิ้น');
  });

  it('should alert when dates are not selected', () => {
    spyOn(window, 'alert');
    component.startDate = '';
    component.endDate = '';
    
    component.exportData();
    
    expect(window.alert).toHaveBeenCalledWith('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด');
  });

  it('should alert when start date is after end date', () => {
    spyOn(window, 'alert');
    component.startDate = '2025-12-31';
    component.endDate = '2025-01-01';
    
    component.exportData();
    
    expect(window.alert).toHaveBeenCalledWith('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
  });

  it('should format Thai date correctly', () => {
    const result = component.formatDateThai('2025-01-15');
    expect(result).toBe('15/01/2568'); // แปลงเป็น พ.ศ.
  });

  it('should return empty string for empty date', () => {
    const result = component.formatDateThai('');
    expect(result).toBe('');
  });

  it('should generate current date time correctly', () => {
    const dateTime = component.getCurrentDateTime();
    expect(dateTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('should sort history in descending order', () => {
    component.sortOrder = 'desc';
    component.sortHistory();
    
    for (let i = 0; i < component.exportHistory.length - 1; i++) {
      const currentDate = new Date(component.exportHistory[i].exportDate);
      const nextDate = new Date(component.exportHistory[i + 1].exportDate);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  it('should sort history in ascending order', () => {
    component.sortOrder = 'asc';
    component.sortHistory();
    
    for (let i = 0; i < component.exportHistory.length - 1; i++) {
      const currentDate = new Date(component.exportHistory[i].exportDate);
      const nextDate = new Date(component.exportHistory[i + 1].exportDate);
      expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
    }
  });

  it('should filter history by date range', () => {
    component.filterStartDate = '2025-09-25';
    component.filterEndDate = '2025-09-28';
    
    component.filterHistory();
    
    // ตรวจสอบว่าข้อมูลที่แสดงอยู่ในช่วงวันที่
    component.exportHistory.forEach(record => {
      const recordDate = new Date(record.exportDate);
      const startDate = new Date(component.filterStartDate);
      const endDate = new Date(component.filterEndDate);
      
      expect(recordDate >= startDate && recordDate <= endDate).toBeTruthy();
    });
  });

  it('should filter by start date only', () => {
    component.filterStartDate = '2025-09-28';
    component.filterEndDate = '';
    
    component.filterHistory();
    
    component.exportHistory.forEach(record => {
      const recordDate = new Date(record.exportDate);
      const startDate = new Date(component.filterStartDate);
      
      expect(recordDate >= startDate).toBeTruthy();
    });
  });

  it('should filter by end date only', () => {
    component.filterStartDate = '';
    component.filterEndDate = '2025-09-28';
    
    component.filterHistory();
    
    component.exportHistory.forEach(record => {
      const recordDate = new Date(record.exportDate);
      const endDate = new Date(component.filterEndDate);
      
      expect(recordDate <= endDate).toBeTruthy();
    });
  });

  it('should clear filters and show all records', () => {
    // กรองข้อมูลก่อน
    component.filterStartDate = '2025-09-28';
    component.filterEndDate = '2025-09-28';
    component.filterHistory();
    
    const filteredLength = component.exportHistory.length;
    
    // ล้างตัวกรอง
    component.clearFilters();
    
    expect(component.filterStartDate).toBe('');
    expect(component.filterEndDate).toBe('');
    expect(component.exportHistory.length).toBe(component.originalExportHistory.length);
  });

  it('should update selected department', () => {
    component.selectedDepartment = 'กลุ่มบริหารวิชาการ';
    expect(component.selectedDepartment).toBe('กลุ่มบริหารวิชาการ');
  });

  it('should update date range', () => {
    component.startDate = '2025-01-01';
    component.endDate = '2025-01-31';
    expect(component.startDate).toBe('2025-01-01');
    expect(component.endDate).toBe('2025-01-31');
  });

  it('should create export record with correct data', () => {
    spyOn(window, 'alert');
    
    component.selectedDepartment = 'กลุ่มบริหารวิชาการ';
    component.startDate = '2025-09-10';
    component.endDate = '2025-09-15';
    component.selectedFormat = 'Excel';
    
    component.exportData();
    
    const latestRecord = component.exportHistory[0];
    expect(latestRecord.department).toBe('กลุ่มบริหารวิชาการ');
    expect(latestRecord.format).toBe('Excel');
  });

  it('should display correct status', () => {
    const successRecord = component.exportHistory.find(r => r.status === 'เสร็จสิ้น');
    const errorRecord = component.originalExportHistory.find(r => r.status === 'ล้มเหลว');
    
    expect(successRecord).toBeDefined();
    expect(errorRecord).toBeDefined();
  });

  it('should apply filters when filterHistory is called', () => {
    spyOn(component, 'applyFilters');
    
    component.filterHistory();
    
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should maintain original data after filtering', () => {
    const originalLength = component.originalExportHistory.length;
    
    component.filterStartDate = '2025-09-28';
    component.filterHistory();
    
    // ข้อมูลต้นฉบับต้องไม่เปลี่ยนแปลง
    expect(component.originalExportHistory.length).toBe(originalLength);
  });
});