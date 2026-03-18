import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { Room } from '../../models/room.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reservation-page">
      <header class="header">
        <h1>Confirmar Reserva</h1>
        <button (click)="goBack()" class="btn-back">← Volver</button>
      </header>

      <div class="content" *ngIf="room">
        <div class="room-summary">
          <h2>Habitación {{ room.roomNumber }}</h2>
          <p>{{ room.type }}</p>
          <p class="price">\${{ room.basePricePerNight }} / noche</p>
        </div>

        <form (ngSubmit)="submitReservation()" class="reservation-form">
          <div class="form-group">
            <label>Fecha de Check-in</label>
            <input type="date" [(ngModel)]="checkInDate" name="checkIn" required 
                   [min]="minDate">
          </div>
          <div class="form-group">
            <label>Fecha de Check-out</label>
            <input type="date" [(ngModel)]="checkOutDate" name="checkOut" required
                   [min]="checkInDate">
          </div>

          <div *ngIf="nights > 0" class="summary">
            <div class="summary-row">
              <span>Noches:</span>
              <span>{{ nights }}</span>
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
              <span>\${{ total | number:'1.2-2' }}</span>
            </div>
          </div>

          <div *ngIf="error" class="error">{{ error }}</div>
          <div *ngIf="success" class="success">{{ success }}</div>

          <button type="submit" class="btn-submit" [disabled]="loading || !isValidDates()">
            {{ loading ? 'Procesando...' : 'Confirmar Reserva' }}
          </button>
        </form>
      </div>

      <div *ngIf="!room && !loading" class="error-container">
        <p>Habitación no encontrada</p>
        <button (click)="goBack()">Volver</button>
      </div>
    </div>
  `,
  styles: [`
    .reservation-page {
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
      max-width: 500px;
      margin: 0 auto;
    }
    .room-summary {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      margin-bottom: 2rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .room-summary h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    .room-summary p {
      margin: 0;
      color: #666;
    }
    .price {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
      margin-top: 0.5rem !important;
    }
    .reservation-form {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    .summary {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 5px;
      margin-bottom: 1.5rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #555;
    }
    .summary-row.total {
      border-top: 1px solid #ddd;
      font-weight: bold;
      font-size: 1.2rem;
      color: #333;
    }
    .error {
      color: #e74c3c;
      margin-bottom: 1rem;
      text-align: center;
    }
    .success {
      color: #27ae60;
      margin-bottom: 1rem;
      text-align: center;
    }
    .btn-submit {
      width: 100%;
      padding: 1rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-submit:hover:not(:disabled) {
      background: #219a52;
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .error-container {
      text-align: center;
      padding: 3rem;
    }
  `]
})
export class ReservationComponent implements OnInit {
  room: Room | null = null;
  checkInDate = '';
  checkOutDate = '';
  loading = false;
  error = '';
  success = '';
  minDate = '';

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.roomService.getRoomById(roomId).subscribe({
        next: (room) => this.room = room,
        error: () => this.router.navigate(['/guest/rooms'])
      });
    }
  }

  get nights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get subtotal(): number {
    if (!this.room) return 0;
    return this.room.basePricePerNight * this.nights;
  }

  get tax(): number {
    return this.subtotal * 0.15;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  isValidDates(): boolean {
    return this.nights > 0 && !!this.checkInDate && !!this.checkOutDate;
  }

  submitReservation(): void {
    if (!this.room || !this.isValidDates()) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    const reservationData = {
      roomId: this.room.id,
      checkInDate: new Date(this.checkInDate),
      checkOutDate: new Date(this.checkOutDate)
    };

    this.reservationService.createReservation(reservationData).subscribe({
      next: () => {
        this.loading = false;
        this.success = '¡Reserva confirmada! Redirigiendo...';
        setTimeout(() => this.router.navigate(['/guest/dashboard']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al crear la reserva';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/guest/rooms']);
  }
}
