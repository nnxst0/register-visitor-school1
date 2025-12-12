import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExportComponent } from './export';
import { FormsModule } from '@angular/forms';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExportComponent,
        HttpClientTestingModule,
        FormsModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ตรวจสอบว่าไม่มี HTTP request ที่ค้างอยู่
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form values', () => {
    expect(component.selectedDepartment).toBe('ทั้งหมด');
    expect(component.startDate).toBeTruthy();
    expect(component.endDate).toBeTruthy();
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

  it('should load export history on init', () => {
    const mockHistory = [
      {
        id: 1,
        exportDate: '2025-12-12 14:30:00',
        department: 'ทั้งหมด',
        dateRange: '01/12/2568 - 12/12/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น',
        recordCount: 25
      }
    ];

    component.ngOnInit();

    const req = httpMock.expectOne('http://localhost:8080/api/export-history');
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);

    expect(component.exportHistory.length).toBe(1);
    expect(component.exportHistory[0].department).toBe('ทั้งหมด');
  });

  it('should handle empty export history', () => {
    component.ngOnInit();

    const req = httpMock.expectOne('http://localhost:8080/api/export-history');
    req.flush([]);

    expect(component.exportHistory.length).toBe(0);
  });

  it('should show error when dates are not selected', () => {
    spyOn(component, 'showErrorAlert');
    component.startDate = '';
    component.endDate = '';

    component.exportData();

    expect(component.showErrorAlert).toHaveBeenCalledWith('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด');
  });

  it('should show error when start date is after end date', () => {
    spyOn(component, 'showErrorAlert');
    component.startDate = '2025-12-31';
    component.endDate = '2025-01-01';

    component.exportData();

    expect(component.showErrorAlert).toHaveBeenCalledWith('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
  });

  it('should format Thai date correctly', () => {
    const result = component.formatDateThai('2025-01-15');
    expect(result).toBe('15/01/2568'); // แปลงเป็น พ.ศ.
  });

  it('should return empty string for empty date', () => {
    const result = component.formatDateThai('');
    expect(result).toBe('');
  });

  it('should format date for file name correctly', () => {
    const result = component.formatDateForFile('2025-12-15');
    expect(result).toBe('20251215');
  });

  it('should format ID card correctly', () => {
    const result = component.formatIDCard('1234567890123');
    expect(result).toBe('1-2345-67890-12-3');
  });

  it('should return original ID card if invalid length', () => {
    const result = component.formatIDCard('12345');
    expect(result).toBe('12345');
  });

  it('should generate current date time correctly', () => {
    const dateTime = component.getCurrentDateTime();
    expect(dateTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('should sort history in descending order', () => {
    component.exportHistory = [
      {
        exportDate: '2025-12-10 10:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/12/2568 - 10/12/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      },
      {
        exportDate: '2025-12-12 14:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/12/2568 - 12/12/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      }
    ];

    component.sortOrder = 'desc';
    component.sortHistory();

    expect(new Date(component.exportHistory[0].exportDate).getTime())
      .toBeGreaterThanOrEqual(new Date(component.exportHistory[1].exportDate).getTime());
  });

  it('should sort history in ascending order', () => {
    component.exportHistory = [
      {
        exportDate: '2025-12-12 14:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/12/2568 - 12/12/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      },
      {
        exportDate: '2025-12-10 10:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/12/2568 - 10/12/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      }
    ];

    component.sortOrder = 'asc';
    component.sortHistory();

    expect(new Date(component.exportHistory[0].exportDate).getTime())
      .toBeLessThanOrEqual(new Date(component.exportHistory[1].exportDate).getTime());
  });

  it('should filter history by date range', () => {
    component.originalExportHistory = [
      {
        exportDate: '2025-09-25 10:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 25/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      },
      {
        exportDate: '2025-09-28 14:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 28/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      },
      {
        exportDate: '2025-10-01 09:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/10/2568 - 01/10/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      }
    ];

    component.filterStartDate = '2025-09-25';
    component.filterEndDate = '2025-09-28';
    component.filterHistory();

    expect(component.exportHistory.length).toBe(2);
    component.exportHistory.forEach(record => {
      const recordDate = new Date(record.exportDate);
      const startDate = new Date(component.filterStartDate);
      const endDate = new Date(component.filterEndDate);
      
      expect(recordDate >= startDate && recordDate <= endDate).toBeTruthy();
    });
  });

  it('should filter by start date only', () => {
    component.originalExportHistory = [
      {
        exportDate: '2025-09-25 10:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 25/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      },
      {
        exportDate: '2025-09-28 14:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 28/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      }
    ];

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
    component.originalExportHistory = [
      {
        exportDate: '2025-09-25 10:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 25/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      },
      {
        exportDate: '2025-09-30 14:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 30/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      }
    ];

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
    component.originalExportHistory = [
      {
        exportDate: '2025-09-25 10:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 25/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      },
      {
        exportDate: '2025-09-28 14:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 28/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      }
    ];

    component.filterStartDate = '2025-09-28';
    component.filterEndDate = '2025-09-28';
    component.filterHistory();

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

  it('should apply filters when filterHistory is called', () => {
    spyOn(component, 'applyFilters');
    
    component.filterHistory();
    
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should maintain original data after filtering', () => {
    component.originalExportHistory = [
      {
        exportDate: '2025-09-25 10:00:00',
        department: 'ทั้งหมด',
        dateRange: '01/09/2568 - 25/09/2568',
        format: 'Excel',
        status: 'เสร็จสิ้น'
      }
    ];

    const originalLength = component.originalExportHistory.length;
    
    component.filterStartDate = '2025-09-28';
    component.filterHistory();
    
    expect(component.originalExportHistory.length).toBe(originalLength);
  });

  it('should handle API error when loading history', () => {
    spyOn(console, 'error');
    
    component.ngOnInit();

    const req = httpMock.expectOne('http://localhost:8080/api/export-history');
    req.error(new ErrorEvent('Network error'));

    expect(component.exportHistory.length).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('should show warning when no data found', () => {
    spyOn(component, 'showWarningAlert');
    component.selectedDepartment = 'ทั้งหมด';
    component.startDate = '2025-12-01';
    component.endDate = '2025-12-10';

    component.exportData();
    
    // Mock confirmation
    if (component.Swal) {
      component.performExport({
        department: 'ทั้งหมด',
        startDate: '01/12/2568',
        endDate: '10/12/2568',
        format: 'Excel'
      });
    }

    const req = httpMock.expectOne((request) => 
      request.url === 'http://localhost:8080/api/visitors'
    );
    req.flush([]); // ส่งข้อมูลว่างกลับ

    expect(component.showWarningAlert).toHaveBeenCalledWith('ไม่พบข้อมูลในช่วงวันที่ที่เลือก');
  });

  it('should load SweetAlert2 if not available', () => {
    (window as any).Swal = undefined;
    
    component.loadSweetAlert();

    const scripts = document.getElementsByTagName('script');
    let foundSweetAlert = false;
    
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes('sweetalert2')) {
        foundSweetAlert = true;
        break;
      }
    }

    expect(foundSweetAlert).toBeTruthy();
  });
});