import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './autentificazione.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  private backEndUrl = 'http://localhost:3000';
  
  constructor(private http: HttpClient, private authService: AuthService ) { }

  generatePersonXlsx(): Observable<Blob> {
    return this.http.get(`${this.backEndUrl}/api/excel/excelPersonGenerator`, {
      headers: this.authService.getHttpHeaders() ,responseType: 'blob' });
  }

  generateCarXlsx(): Observable<Blob> {
    return this.http.get(`${this.backEndUrl}/api/excel/excelCarGenerator`, {
      headers: this.authService.getHttpHeaders(), responseType: 'blob' });
  }

  generatePointXlsx(): Observable<Blob> {
    return this.http.get(`${this.backEndUrl}/api/excel/excelPointGenerator`, {
      headers: this.authService.getHttpHeaders(), responseType: 'blob' });
  }
}

