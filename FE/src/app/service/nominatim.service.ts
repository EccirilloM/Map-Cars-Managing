import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NominatimService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org';

  constructor(private http: HttpClient) { }

  search(query: string): Observable<any> {
    return this.http.get<any>(`${this.nominatimUrl}/search?format=json&q=${query}`);
  }

  reverse(lat: number, lon: number): Observable<any> {
    return this.http.get<any>(`${this.nominatimUrl}/reverse?format=json&lat=${lat}&lon=${lon}`);
  }
}
