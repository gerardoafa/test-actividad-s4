import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private readonly API_URL = 'https://localhost:7117/api/Guests';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllGuests(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL, { headers: this.getHeaders() });
  }

  getGuestById(guestId: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${guestId}`, { headers: this.getHeaders() });
  }
}
