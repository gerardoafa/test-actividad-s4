import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest } from '../models/reservation.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly API_URL = 'https://localhost:7117/api/Reservations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createReservation(data: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.API_URL, data, { headers: this.getHeaders() });
  }

  getMyReservation(): Observable<Reservation | null> {
    return this.http.get<Reservation>(`${this.API_URL}/my-reservation`, { headers: this.getHeaders() });
  }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.API_URL, { headers: this.getHeaders() });
  }

  cancelReservation(reservationId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${reservationId}`, { headers: this.getHeaders() });
  }
}
