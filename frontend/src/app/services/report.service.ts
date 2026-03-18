import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:5000/api/reports';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getOccupancyReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/occupancy`, { headers: this.getHeaders() });
  }

  getRevenueReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/revenue`, { headers: this.getHeaders() });
  }

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`, { headers: this.getHeaders() });
  }
}
