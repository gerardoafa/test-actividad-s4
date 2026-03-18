import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../services/room.service';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="header">
        <h1>Habitaciones Disponibles</h1>
        <button class="btn-back" (click)="goBack()">← Volver</button>
      </header>

      <div class="filters">
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          (input)="filterRooms()"
          placeholder="Buscar por número o tipo..."
          class="search-input"
        >
        <select [(ngModel)]="selectedType" (change)="filterRooms()" class="filter-select">
          <option value="">Todos los tipos</option>
          <option value="Estándar">Estándar</option>
          <option value="Junior Suite">Junior Suite</option>
          <option value="Suite Deluxe">Suite Deluxe</option>
          <option value="Familiar">Familiar</option>
          <option value="Con vista al mar">Con vista al mar</option>
        </select>
      </div>

      <div class="rooms-grid">
        <div class="room-card" *ngFor="let room of filteredRooms">
          <div class="room-image">
            <div class="image-placeholder">🏨</div>
          </div>
          <div class="room-content">
            <div class="room-header">
              <h3>Habitación {{ room.roomNumber }}</h3>
              <div class="rating">
                <span>⭐ {{ room.averageRating | number:'1.1-1' }}</span>
                <span class="reviews">({{ room.totalRatings }} reseñas)</span>
              </div>
            </div>
            <div class="room-type">{{ room.type }}</div>
            <p class="room-description">{{ room.description }}</p>
            <div class="room-features">
              <span class="feature">👤 {{ room.capacity }} personas</span>
            </div>
            <div class="room-footer">
              <div class="price">
                <span class="amount">\${{ room.basePricePerNight }}</span>
                <span class="per-night">/noche</span>
              </div>
              <button 
                class="btn-reserve" 
                [disabled]="!room.isAvailable"
                (click)="reserveRoom(room)"
              >
                {{ room.isAvailable ? 'Reservar' : 'No Disponible' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="filteredRooms.length === 0" class="no-rooms">
        <p>No hay habitaciones disponibles que coincidan con tu búsqueda</p>
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
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .search-input, .filter-select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }
    .search-input {
      flex: 1;
    }
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .room-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    .room-card:hover {
      transform: translateY(-4px);
    }
    .room-image {
      height: 180px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-placeholder {
      font-size: 4rem;
    }
    .room-content {
      padding: 1.5rem;
    }
    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    .room-header h3 {
      margin: 0;
      color: #333;
    }
    .rating {
      color: #f39c12;
      font-size: 0.9rem;
    }
    .reviews {
      color: #999;
      font-size: 0.8rem;
    }
    .room-type {
      color: #667eea;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .room-description {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    .room-features {
      margin-bottom: 1rem;
    }
    .feature {
      display: inline-block;
      background: #f0f0f0;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      color: #666;
      margin-right: 0.5rem;
    }
    .room-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    .price .amount {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
    .price .per-night {
      color: #999;
      font-size: 0.9rem;
    }
    .btn-reserve {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }
    .btn-reserve:hover:not(:disabled) {
      background: #5568d3;
    }
    .btn-reserve:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .no-rooms {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 12px;
    }
  `]
})
export class RoomsListComponent implements OnInit {
  private roomService = inject(RoomService);
  private router = inject(Router);

  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  searchTerm = '';
  selectedType = '';

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms.filter(r => r.isAvailable);
        this.filteredRooms = this.rooms;
      },
      error: (err) => console.error('Error loading rooms:', err)
    });
  }

  filterRooms(): void {
    this.filteredRooms = this.rooms.filter(room => {
      const matchesSearch = !this.searchTerm || 
        room.roomNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.selectedType || room.type === this.selectedType;
      return matchesSearch && matchesType;
    });
  }

  reserveRoom(room: Room): void {
    this.router.navigate(['/guest/reservation', room.id]);
  }

  goBack(): void {
    this.router.navigate(['/guest/dashboard']);
  }
}
