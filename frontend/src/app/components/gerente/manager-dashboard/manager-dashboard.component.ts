import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RoomService } from '../../../services/room.service';
import { ReservationService } from '../../../services/reservation.service';
import { ReportService } from '../../../services/report.service';
import { Room } from '../../../models/room.model';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>Panel de Gerente</h1>
        <div class="user-info">
          <span>Bienvenido, {{ userName }}</span>
          <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>

      <nav class="nav-menu">
        <a (click)="navigateTo('rooms')">Gestión de Habitaciones</a>
        <a (click)="navigateTo('guests')">Lista de Huéspedes</a>
        <a (click)="navigateTo('reports')">Reportes</a>
      </nav>

      <main class="content">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Habitaciones Totales</h3>
            <p class="stat-number">{{ totalRooms }}</p>
          </div>
          <div class="stat-card">
            <h3>Habitaciones Disponibles</h3>
            <p class="stat-number">{{ availableRooms }}</p>
          </div>
          <div class="stat-card">
            <h3>Reservas Activas</h3>
            <p class="stat-number">{{ totalReservations }}</p>
          </div>
          <div class="stat-card">
            <h3>Ingresos Totales</h3>
            <p class="stat-number">\${{ totalRevenue | number:'1.2-2' }}</p>
          </div>
        </div>

        <div class="recent-section">
          <h2>Reservas Recientes</h2>
          <table class="reservations-table">
            <thead>
              <tr>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let res of recentReservations">
                <td>{{ res.userName }}</td>
                <td>{{ res.roomNumber }} ({{ res.roomType }})</td>
                <td>{{ res.checkInDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ res.checkOutDate | date:'dd/MM/yyyy' }}</td>
                <td><span class="status-badge" [class]="res.status">{{ res.status }}</span></td>
              </tr>
              <tr *ngIf="recentReservations.length === 0">
                <td colspan="5" class="no-data">No hay reservas recientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: #f5f7fa;
    }
    .header {
      background: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header h1 {
      margin: 0;
      color: #333;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .btn-logout {
      padding: 0.5rem 1rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .nav-menu {
      background: #667eea;
      padding: 1rem 2rem;
      display: flex;
      gap: 2rem;
    }
    .nav-menu a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .nav-menu a:hover {
      background: rgba(255,255,255,0.2);
    }
    .content {
      padding: 2rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
    }
    .stat-number {
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
    }
    .recent-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .recent-section h2 {
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .reservations-table {
      width: 100%;
      border-collapse: collapse;
    }
    .reservations-table th, .reservations-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .reservations-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .status-badge.confirmed {
      background: #d5f4e6;
      color: #27ae60;
    }
    .status-badge.pending {
      background: #fef3cd;
      color: #f39c12;
    }
    .no-data {
      text-align: center;
      color: #999;
      padding: 2rem !important;
    }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private roomService = inject(RoomService);
  private reservationService = inject(ReservationService);
  private reportService = inject(ReportService);
  private router = inject(Router);

  userName = '';
  totalRooms = 0;
  availableRooms = 0;
  totalReservations = 0;
  totalRevenue = 0;
  recentReservations: Reservation[] = [];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user?.fullName || 'Gerente';
    this.loadData();
  }

  loadData(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.totalRooms = rooms.length;
        this.availableRooms = rooms.filter(r => r.isAvailable).length;
      }
    });

    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.totalReservations = reservations.length;
        this.totalRevenue = reservations.reduce((sum, r) => sum + Number(r.totalCost), 0);
        this.recentReservations = reservations.slice(0, 5);
      }
    });
  }

  navigateTo(section: string): void {
    switch(section) {
      case 'rooms':
        this.router.navigate(['/manager/rooms']);
        break;
      case 'guests':
        this.router.navigate(['/manager/guests']);
        break;
      case 'reports':
        this.router.navigate(['/manager/reports']);
        break;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
