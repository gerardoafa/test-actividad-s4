import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { ReservationService } from '../../../services/reservation.service';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <header class="header">
        <h1>Confirmar Reserva</h1>
        <button class="btn-back" (click)="goBack()">← Volver</button>
      </header>

      <div *ngIf="room" class="reservation-container">
        <div class="room-info">
          <h2>Habitación {{ room.roomNumber }}</h2>
          <p class="room-type">{{ room.type }}</p>
          <p class="room-description">{{ room.description }}</p>
          <p class="room-capacity">👤 Capacidad: {{ room.capacity }} personas</p>
          <p class="room-price">\${{ room.basePricePerNight }} / noche</p>
        </div>

        <form class="reservation-form" (ngSubmit)="submitReservation()">
          <h3>Selecciona tus Fechas</h3>
          
          <div class="form-group">
            <label for="checkIn">Fecha de Check-in</label>
            <input 
              type="date" 
              id="checkIn" 
              [(ngModel)]="checkInDate" 
              name="checkIn" 
              required
              [min]="minDate"
              (change)="calculateTotal()"
            >
          </div>

          <div class="form-group">
            <label for="checkOut">Fecha de Check-out</label>
            <input 
              type="date" 
              id="checkOut" 
              [(ngModel)]="checkOutDate" 
              name="checkOut" 
              required
              [min]="minDate"
              (change)="calculateTotal()"
            >
          </div>

          <div class="summary" *ngIf="nights > 0">
            <div class="summary-row">
              <span>Noches:</span>
              <span>{{ nights }}</span>
            </div>
            <div class="summary-row">
              <span>Precio por noche:</span>
              <span>\${{ room.basePricePerNight }}</span>
            </div>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>\${{ subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Impuesto (15%):</span>
              <span>\${{ tax | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>\${{ totalCost | number:'1.2-2' }}</span>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading || !isValidDates()">
            {{ loading ? 'Procesando...' : 'Confirmar Reserva' }}
          </button>
        </form>
      </div>

      <div *ngIf="!room" class="loading">
        <p>Cargando información de la habitación...</p>
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
    .reservation-container {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .room-info {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .room-info h2 {
      margin-top: 0;
      color: #333;
    }
    .room-type {
      color: #667eea;
      font-weight: 500;
      font-size: 1.1rem;
    }
    .room-description {
      color: #666;
      line-height: 1.6;
    }
    .room-capacity, .room-price {
      color: #555;
      font-size: 1rem;
    }
    .room-price {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
    }
    .reservation-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .reservation-form h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
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
    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .summary {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #555;
    }
    .summary-row.total {
      border-top: 2px solid #ddd;
      margin-top: 0.5rem;
      padding-top: 1rem;
      font-weight: bold;
      font-size: 1.2rem;
      color: #333;
    }
    .error-message {
      color: #e74c3c;
      padding: 0.75rem;
      background: #fadbd8;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .btn-submit {
      width: 100%;
      padding: 1rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-submit:hover:not(:disabled) {
      background: #5568d3;
    }
    .btn-submit:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .loading {
      text-align: center;
      padding: 4rem;
    }
    @media (max-width: 768px) {
      .reservation-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReservationComponent implements OnInit {
  private roomService = inject(RoomService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  room: Room | null = null;
  checkInDate = '';
  checkOutDate = '';
  nights = 0;
  subtotal = 0;
  tax = 0;
  totalCost = 0;
  loading = false;
  errorMessage = '';
  minDate = '';

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.loadRoom(roomId);
    }
    this.setMinDate();
  }

  setMinDate(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  loadRoom(roomId: string): void {
    this.roomService.getRoomById(roomId).subscribe({
      next: (room) => this.room = room,
      error: (err) => {
        this.errorMessage = 'Error al cargar la habitación';
      }
    });
  }

  isValidDates(): boolean {
    return !!(this.checkInDate && this.checkOutDate && this.nights > 0);
  }

  calculateTotal(): void {
    if (this.checkInDate && this.checkOutDate && this.room) {
      const checkIn = new Date(this.checkInDate);
      const checkOut = new Date(this.checkOutDate);
      
      if (checkOut > checkIn) {
        const diffTime = checkOut.getTime() - checkIn.getTime();
        this.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.subtotal = this.room.basePricePerNight * this.nights;
        this.tax = this.subtotal * 0.15;
        this.totalCost = this.subtotal + this.tax;
      } else {
        this.nights = 0;
        this.subtotal = 0;
        this.tax = 0;
        this.totalCost = 0;
      }
    }
  }

  submitReservation(): void {
    if (!this.room || !this.isValidDates()) return;

    this.loading = true;
    this.errorMessage = '';

    this.reservationService.createReservation({
      roomId: this.room.id,
      checkInDate: new Date(this.checkInDate),
      checkOutDate: new Date(this.checkOutDate)
    }).subscribe({
      next: (reservation) => {
        this.loading = false;
        this.router.navigate(['/guest/reservation/confirmation', reservation.id]);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al crear la reserva';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/guest/rooms']);
  }
}
