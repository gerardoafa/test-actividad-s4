import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-already-reserved',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="info-card">
        <div class="info-icon">ℹ️</div>
        <h1>Ya tienes una reserva</h1>
        <p class="message">
          Solo puedes realizar una reserva por cuenta. Ya tienes una reserva activa en nuestro sistema.
        </p>

        <div *ngIf="myReservation" class="reservation-preview">
          <h3>Tu Reserva Actual</h3>
          <div class="detail">
            <span class="label">Habitación:</span>
            <span class="value">{{ myReservation.roomNumber }} ({{ myReservation.roomType }})</span>
          </div>
          <div class="detail">
            <span class="label">Check-in:</span>
            <span class="value">{{ myReservation.checkInDate | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="detail">
            <span class="label">Check-out:</span>
            <span class="value">{{ myReservation.checkOutDate | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" (click)="goToDashboard()">
            Ir a Mi Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .info-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    .info-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #333;
      margin: 0 0 0.5rem 0;
    }
    .message {
      color: #666;
      margin-bottom: 2rem;
    }
    .reservation-preview {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      text-align: left;
    }
    .reservation-preview h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #333;
    }
    .detail {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }
    .label {
      color: #666;
    }
    .value {
      color: #333;
      font-weight: 500;
    }
    .btn-primary {
      padding: 1rem 2rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-primary:hover {
      background: #5568d3;
    }
  `]
})
export class AlreadyReservedComponent implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  myReservation: Reservation | null = null;

  ngOnInit(): void {
    this.loadMyReservation();
  }

  loadMyReservation(): void {
    this.reservationService.getMyReservation().subscribe({
      next: (reservation) => {
        this.myReservation = reservation;
      },
      error: (err) => console.error('Error loading reservation:', err)
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/guest/dashboard']);
  }
}
