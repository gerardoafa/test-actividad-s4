import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { Room, RoomFormData } from '../../../models/room.model';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="header">
        <h1>{{ isEditMode ? 'Editar' : 'Nueva' }} Habitación</h1>
        <button class="btn-back" (click)="goBack()">← Volver</button>
      </header>

      <form class="form-container" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="roomNumber">Número/Nombre de Habitación</label>
          <input 
            type="text" 
            id="roomNumber" 
            [(ngModel)]="roomData.roomNumber" 
            name="roomNumber" 
            required
            placeholder="Ej: 101, Suite Luna, Bungalow 12"
          >
        </div>

        <div class="form-group">
          <label for="type">Tipo de Habitación</label>
          <select id="type" [(ngModel)]="roomData.type" name="type" required>
            <option value="">Seleccionar tipo</option>
            <option value="Estándar">Estándar</option>
            <option value="Junior Suite">Junior Suite</option>
            <option value="Suite Deluxe">Suite Deluxe</option>
            <option value="Familiar">Familiar</option>
            <option value="Con vista al mar">Con vista al mar</option>
          </select>
        </div>

        <div class="form-group">
          <label for="capacity">Capacidad (personas)</label>
          <input 
            type="number" 
            id="capacity" 
            [(ngModel)]="roomData.capacity" 
            name="capacity" 
            required
            min="1"
            placeholder="Número de personas"
          >
        </div>

        <div class="form-group">
          <label for="basePricePerNight">Precio por Noche ($)</label>
          <input 
            type="number" 
            id="basePricePerNight" 
            [(ngModel)]="roomData.basePricePerNight" 
            name="basePricePerNight" 
            required
            min="0"
            step="0.01"
            placeholder="Precio base"
          >
        </div>

        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea 
            id="description" 
            [(ngModel)]="roomData.description" 
            name="description" 
            rows="4"
            placeholder="Describe las características de la habitación..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>
            <input 
              type="checkbox" 
              [(ngModel)]="isAvailable" 
              name="isAvailable"
            >
            Disponible para reservas
          </label>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="goBack()">Cancelar</button>
          <button type="submit" class="btn-save" [disabled]="loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
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
    .form-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
    }
    .error-message {
      color: #e74c3c;
      padding: 0.75rem;
      background: #fadbd8;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    .btn-cancel, .btn-save {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
    }
    .btn-cancel {
      background: #6c757d;
      color: white;
    }
    .btn-save {
      background: #667eea;
      color: white;
    }
    .btn-save:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class RoomFormComponent implements OnInit {
  private roomService = inject(RoomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  roomData: RoomFormData = {
    roomNumber: '',
    type: '',
    capacity: 1,
    description: '',
    basePricePerNight: 0
  };
  
  isAvailable = true;
  isEditMode = false;
  roomId = '';
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.roomId = id;
      this.loadRoom();
    }
  }

  loadRoom(): void {
    this.roomService.getRoomById(this.roomId).subscribe({
      next: (room) => {
        this.roomData = {
          roomNumber: room.roomNumber,
          type: room.type,
          capacity: room.capacity,
          description: room.description,
          basePricePerNight: room.basePricePerNight
        };
        this.isAvailable = room.isAvailable;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar habitación';
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    const room: Room = {
      id: this.roomId,
      ...this.roomData,
      isAvailable: this.isAvailable,
      averageRating: 0,
      totalRatings: 0
    };

    const request = this.isEditMode
      ? this.roomService.updateRoom(this.roomId, this.roomData)
      : this.roomService.createRoom(this.roomData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/manager/rooms']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al guardar habitación';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/rooms']);
  }
}
