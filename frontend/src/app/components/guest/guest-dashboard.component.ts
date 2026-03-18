import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>Mi Dashboard</h1>
        <div class="user-info">
          <span>Hola, {{ user?.fullName }}</span>
          <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <div class="content">
        <div class="welcome-card">
          <h2>¡Bienvenido, {{ user?.fullName }}!</h2>
          <p *ngIf="!hasReservation">Explora nuestras habitaciones y realiza tu reserva</p>
          <p *ngIf="hasReservation">Ya tienes una reserva activa</p>
        </div>

        <div *ngIf="hasReservation && reservation" class="reservation-card">
          <h3>Tu Reserva</h3>
          <div class="reservation-details">
            <div class="detail">
              <label>Habitación:</label>
              <span>{{ reservation.roomNumber }} - {{ reservation.roomType }}</span>
            </div>
            <div class="detail">
              <label>Check-in:</label>
              <span>{{ reservation.checkInDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail">
              <label>Check-out:</label>
              <span>{{ reservation.checkOutDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail">
              <label>Noches:</label>
              <span>{{ reservation.nights }}</span>
            </div>
            <div class="detail">
              <label>Total:</label>
              <span>\${{ reservation.totalCost | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button *ngIf="!hasReservation" (click)="goToRooms()" class="btn-primary">
            Ver Habitaciones Disponibles
          </button>
          <button *ngIf="hasReservation" (click)="goToRooms()" class="btn-secondary">
            Ver Detalles de Habitación
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
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
    .btn-logout {
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid white;
      border-radius: 5px;
      cursor: pointer;
    }
    .btn-logout:hover {
      background: rgba(255,255,255,0.3);
    }
    .content {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .welcome-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .reservation-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-left: 4px solid #27ae60;
    }
    .reservation-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .detail {
      display: flex;
      flex-direction: column;
    }
    .detail label {
      font-size: 0.85rem;
      color: #777;
      margin-bottom: 0.25rem;
    }
    .detail span {
      font-size: 1.1rem;
      font-weight: 500;
      color: #333;
    }
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-primary, .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5568d3;
    }
    .btn-secondary {
      background: #27ae60;
      color: white;
    }
    .btn-secondary:hover {
      background: #219a52;
    }
  `]
})
export class GuestDashboardComponent implements OnInit {
  user = this.authService.getUser();
  reservation: Reservation | null = null;
  hasReservation = false;

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservation();
  }

  loadReservation(): void {
    this.reservationService.getMyReservation().subscribe({
      next: (res) => {
        this.reservation = res;
        this.hasReservation = true;
      },
      error: () => {
        this.hasReservation = false;
      }
    });
  }

  goToRooms(): void {
    this.router.navigate(['/guest/rooms']);
  }

  logout(): void {
    this.authService.logout();
  }
}
