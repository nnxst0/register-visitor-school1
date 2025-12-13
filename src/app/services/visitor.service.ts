import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Visitor {
  id?: number;
  idCard: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  phone: string;
  licensePlate?: string;
  houseNumber?: string;
  moo?: string;
  soi?: string;
  road?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  rfid: string;
  department?: string;
  officerName?: string;
  idCardImage?: string;
}

export interface VisitorListResponse {
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
  exitTime?: string;
}

export interface RFIDCardResponse {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
}

export interface ReturnCardHistoryResponse {
  no: number;
  cardId: string;
  name: string;
  timeIn: string;
  timeOut: string;
  date: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private apiUrl = 'http://localhost:8080/api/visitors';

  constructor(private http: HttpClient) {}

  // สร้าง Visitor ใหม่
  createVisitor(visitor: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(this.apiUrl, visitor);
  }

  // ดึงรายการ Visitors
  getVisitors(params?: {
    search?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: string;
  }): Observable<VisitorListResponse[]> {
    let httpParams = new HttpParams();
    
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params?.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params?.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<VisitorListResponse[]>(this.apiUrl, { params: httpParams });
  }

  // ดึง Visitor ตาม ID
  getVisitorById(id: number): Observable<Visitor> {
    return this.http.get<Visitor>(`${this.apiUrl}/${id}`);
  }

  // ============ Return Card Methods ============

  // ค้นหาข้อมูลบัตรจาก RFID
  searchByRFID(cardId: string): Observable<RFIDCardResponse> {
    return this.http.get<RFIDCardResponse>(`${this.apiUrl}/rfid/${cardId}`);
  }

  // คืนบัตร
  returnCard(cardId: string, checkOut: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/return/${cardId}`, { checkOut });
  }

  // ดึงประวัติการคืนบัตร
  getReturnHistory(params?: {
    search?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: string;
  }): Observable<ReturnCardHistoryResponse[]> {
    let httpParams = new HttpParams();
    
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params?.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params?.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<ReturnCardHistoryResponse[]>(
      `${this.apiUrl}/return-history`, 
      { params: httpParams }
    );
  }
}