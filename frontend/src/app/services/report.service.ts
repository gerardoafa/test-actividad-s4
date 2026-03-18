import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationStatistics } from '../models/statistics.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly API_URL = 'https://localhost:7117/api/Reports';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getStatistics(): Observable<ReservationStatistics> {
    return this.http.get<ReservationStatistics>(`${this.API_URL}/statistics`, { headers: this.getHeaders() });
  }
}
