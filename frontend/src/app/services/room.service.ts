import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomFormData } from '../models/room.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:5000/api/rooms';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllRooms(type?: string): Observable<Room[]> {
    const url = type ? `${this.apiUrl}?type=${type}` : this.apiUrl;
    return this.http.get<Room[]>(url);
  }

  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${roomId}`);
  }

  createRoom(roomData: RoomFormData): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, roomData, { headers: this.getHeaders() });
  }

  updateRoom(roomId: string, roomData: RoomFormData): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${roomId}`, roomData, { headers: this.getHeaders() });
  }

  deleteRoom(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roomId}`, { headers: this.getHeaders() });
  }

  searchRooms(searchTerm: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/search/${searchTerm}`);
  }
}
