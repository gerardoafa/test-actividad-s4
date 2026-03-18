import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="header">
        <h1>Gestión de Habitaciones</h1>
        <button class="btn-back" (click)="goBack()">← Volver</button>
      </header>

      <div class="actions">
        <button class="btn-primary" (click)="createRoom()">+ Nueva Habitación</button>
      </div>

      <div class="rooms-grid">
        <div class="room-card" *ngFor="let room of rooms">
          <div class="room-header">
            <h3>Habitación {{ room.roomNumber }}</h3>
            <span class="badge" [class.available]="room.isAvailable" [class.unavailable]="!room.isAvailable">
              {{ room.isAvailable ? 'Disponible' : 'No Disponible' }}
            </span>
          </div>
          <div class="room-details">
            <p><strong>Tipo:</strong> {{ room.type }}</p>
            <p><strong>Capacidad:</strong> {{ room.capacity }} personas</p>
            <p><strong>Precio:</strong> \${{ room.basePricePerNight }}/noche</p>
            <p class="description">{{ room.description }}</p>
            <div class="rating">
              <span>⭐ {{ room.averageRating | number:'1.1-1' }}</span>
              <span>({{ room.totalRatings }} reseñas)</span>
            </div>
          </div>
          <div class="room-actions">
            <button class="btn-edit" (click)="editRoom(room)">Editar</button>
            <button class="btn-delete" (click)="deleteRoom(room)">Eliminar</button>
          </div>
        </div>
      </div>

      <div *ngIf="rooms.length === 0" class="no-rooms">
        <p>No hay habitaciones registradas</p>
        <button class="btn-primary" (click)="createRoom()">Crear primera habitación</button>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: #f5f7fa;
      padding: 2rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header h1 {
      margin: 0;
      color: #333;
    }
    .btn-back {
      padding: 0.5rem 1rem;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .actions {
      margin-bottom: 2rem;
    }
    .btn-primary {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
    }
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .room-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .room-header h3 {
      margin: 0;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .badge.available {
      background: #d5f4e6;
      color: #27ae60;
    }
    .badge.unavailable {
      background: #fadbd8;
      color: #e74c3c;
    }
    .room-details p {
      margin: 0.5rem 0;
      color: #555;
    }
    .description {
      color: #666;
      font-size: 0.9rem;
    }
    .rating {
      margin-top: 1rem;
      color: #f39c12;
    }
    .room-actions {
      margin-top: 1.5rem;
      display: flex;
      gap: 1rem;
    }
    .btn-edit, .btn-delete {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-edit {
      background: #3498db;
      color: white;
    }
    .btn-delete {
      background: #e74c3c;
      color: white;
    }
    .no-rooms {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 12px;
    }
    .no-rooms p {
      color: #666;
      margin-bottom: 1rem;
    }
  `]
})
export class RoomManagementComponent implements OnInit {
  private roomService = inject(RoomService);
  private router = inject(Router);

  rooms: Room[] = [];

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => this.rooms = rooms,
      error: (err) => console.error('Error loading rooms:', err)
    });
  }

  createRoom(): void {
    this.router.navigate(['/manager/rooms/new']);
  }

  editRoom(room: Room): void {
    this.router.navigate(['/manager/rooms/edit', room.id]);
  }

  deleteRoom(room: Room): void {
    if (confirm(`¿Estás seguro de eliminar la habitación ${room.roomNumber}?`)) {
      this.roomService.deleteRoom(room.id).subscribe({
        next: () => this.loadRooms(),
        error: (err) => alert(err.error?.message || 'Error al eliminar habitación')
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/manager/dashboard']);
  }
}
