import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-reservation-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="confirmation-card">
        <div class="success-icon">✓</div>
        <h1>¡Reserva Confirmada!</h1>
        <p class="message">Tu reserva ha sido creada exitosamente.</p>

        <div *ngIf="reservation" class="reservation-details">
          <div class="detail-row">
            <span class="label">Número de Reserva:</span>
            <span class="value">{{ reservation.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Habitación:</span>
            <span class="value">{{ reservation.roomNumber }} ({{ reservation.roomType }})</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha de Check-in:</span>
            <span class="value">{{ reservation.checkInDate | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Fecha de Check-out:</span>
            <span class="value">{{ reservation.checkOutDate | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Número de Noches:</span>
            <span class="value">{{ reservation.nights }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">Total Pagado:</span>
            <span class="value">\${{ reservation.totalCost | number:'1.2-2' }}</span>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .confirmation-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    .success-icon {
      width: 80px;
      height: 80px;
      background: #27ae60;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      margin: 0 auto 1.5rem;
    }
    h1 {
      color: #333;
      margin: 0 0 0.5rem 0;
    }
    .message {
      color: #666;
      margin-bottom: 2rem;
    }
    .reservation-details {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      text-align: left;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-row.total {
      border-top: 2px solid #ddd;
      margin-top: 0.5rem;
      padding-top: 1rem;
      font-weight: bold;
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
export class ReservationConfirmationComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reservation: Reservation | null = null;

  ngOnInit(): void {
    const reservationId = this.route.snapshot.paramMap.get('id');
    if (reservationId) {
      this.loadReservation();
    }
  }

  loadReservation(): void {
    this.reservationService.getMyReservation().subscribe({
      next: (reservation) => {
        if (reservation) {
          this.reservation = reservation;
        }
      },
      error: (err) => console.error('Error loading reservation:', err)
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/guest/dashboard']);
  }
}
