import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly API_URL = 'https://localhost:7117/api/Rooms';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllRooms(type?: string): Observable<Room[]> {
    const url = type ? `${this.API_URL}?type=${type}` : this.API_URL;
    return this.http.get<Room[]>(url);
  }

  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<Room>(`${this.API_URL}/${roomId}`);
  }

  searchRooms(searchTerm: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.API_URL}/search/${searchTerm}`);
  }

  createRoom(room: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(this.API_URL, room, { headers: this.getHeaders() });
  }

  updateRoom(roomId: string, room: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.API_URL}/${roomId}`, room, { headers: this.getHeaders() });
  }

  deleteRoom(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${roomId}`, { headers: this.getHeaders() });
  }
}
