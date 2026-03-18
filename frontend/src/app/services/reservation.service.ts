import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest } from '../models/reservation.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:5000/api/reservations';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createReservation(reservationData: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservationData, { headers: this.getHeaders() });
  }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getMyReservation(): Observable<Reservation | null> {
    return this.http.get<Reservation | null>(`${this.apiUrl}/my-reservation`, { headers: this.getHeaders() });
  }
}
