import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="rooms-page">
      <header class="header">
        <h1>Habitaciones Disponibles</h1>
        <div class="user-info">
          <span>{{ user?.fullName }}</span>
          <button (click)="goBack()" class="btn-back">← Volver</button>
        </div>
      </header>

      <div class="content">
        <div *ngIf="loading" class="loading">Cargando habitaciones...</div>
        
        <div *ngIf="!loading && rooms.length === 0" class="no-rooms">
          No hay habitaciones disponibles
        </div>

        <div class="rooms-grid">
          <div *ngFor="let room of rooms" class="room-card">
            <div class="room-image">
              <div class="room-number">{{ room.roomNumber }}</div>
            </div>
            <div class="room-info">
              <h3>{{ room.type }}</h3>
              <p class="description">{{ room.description }}</p>
              <div class="room-details">
                <span>👥 {{ room.capacity }} personas</span>
                <span>⭐ {{ room.averageRating | number:'1.1-1' }} ({{ room.totalRatings }})</span>
              </div>
              <div class="price">
                <span class="amount">\${{ room.basePricePerNight }}</span>
                <span class="per-night">/noche</span>
              </div>
              <button (click)="selectRoom(room)" class="btn-reserve">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rooms-page {
      min-height: 100vh;
      background: #f5f5f5;
    }
    .header {
      background: #667eea;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .btn-back {
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid white;
      border-radius: 5px;
      cursor: pointer;
    }
    .content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .loading, .no-rooms {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #777;
    }
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }
    .room-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    .room-card:hover {
      transform: translateY(-5px);
    }
    .room-image {
      height: 150px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .room-number {
      font-size: 3rem;
      font-weight: bold;
      color: white;
      opacity: 0.8;
    }
    .room-info {
      padding: 1.5rem;
    }
    .room-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    .description {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .room-details {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #555;
    }
    .price {
      margin-bottom: 1rem;
    }
    .price .amount {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
    }
    .price .per-night {
      color: #777;
      font-size: 0.9rem;
    }
    .btn-reserve {
      width: 100%;
      padding: 0.75rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-reserve:hover {
      background: #219a52;
    }
  `]
})
export class RoomsListComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  user = this.authService.getUser();

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms.filter(r => r.isAvailable);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectRoom(room: Room): void {
    this.router.navigate(['/guest/reservation', room.id]);
  }

  goBack(): void {
    this.router.navigate(['/guest/dashboard']);
  }
}
