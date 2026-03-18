import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { ReservationStatistics } from '../../models/statistics.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>Panel de Gerente</h1>
        <div class="user-info">
          <span>Bienvenido, {{ user?.fullName }}</span>
          <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <nav class="nav-bar">
        <a routerLink="/manager/dashboard" class="nav-link active">Dashboard</a>
        <a routerLink="/manager/rooms" class="nav-link" *ngIf="isManager">Habitaciones</a>
        <a routerLink="/manager/guests" class="nav-link">Huéspedes</a>
        <a routerLink="/manager/reports" class="nav-link">Reportes</a>
      </nav>

      <div class="content">
        <div *ngIf="loading" class="loading">Cargando estadísticas...</div>

        <div *ngIf="!loading && stats" class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🏨</div>
            <div class="stat-value">{{ stats.totalRooms }}</div>
            <div class="stat-label">Total Habitaciones</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">{{ stats.totalNightsReserved }}</div>
            <div class="stat-label">Noches Reservadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-value">{{ stats.occupancyPercentage | number:'1.1-1' }}%</div>
            <div class="stat-label">Ocupación</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-value">\${{ stats.totalRevenue | number:'1.0-0' }}</div>
            <div class="stat-label">Ingresos Totales</div>
          </div>
        </div>

        <div *ngIf="!loading && stats" class="charts-section">
          <div class="chart-card">
            <h3>Reservas por Tipo de Habitación</h3>
            <div class="chart-content">
              <div *ngFor="let item of reservationsByType | keyvalue" class="chart-row">
                <span class="label">{{ item.key }}</span>
                <div class="bar-container">
                  <div class="bar" [style.width.%]="getPercentage(item.value, maxReservationsByType)"></div>
                </div>
                <span class="value">{{ item.value }}</span>
              </div>
            </div>
          </div>
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
    .nav-bar {
      background: white;
      padding: 0 2rem;
      display: flex;
      gap: 1rem;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .nav-link {
      padding: 1rem;
      text-decoration: none;
      color: #555;
      border-bottom: 3px solid transparent;
    }
    .nav-link:hover, .nav-link.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }
    .content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .loading {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #777;
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
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }
    .stat-label {
      color: #777;
      font-size: 0.9rem;
    }
    .charts-section {
      display: grid;
      gap: 1.5rem;
    }
    .chart-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .chart-card h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    .chart-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }
    .chart-row .label {
      width: 100px;
      color: #555;
    }
    .bar-container {
      flex: 1;
      height: 25px;
      background: #f0f0f0;
      border-radius: 5px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 5px;
      transition: width 0.5s ease;
    }
    .chart-row .value {
      width: 40px;
      text-align: right;
      font-weight: 500;
      color: #333;
    }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  user = this.authService.getUser();
  isManager = false;
  stats: ReservationStatistics | null = null;
  loading = true;
  reservationsByType: { [key: string]: number } = {};
  maxReservationsByType = 0;

  constructor(
    private authService: AuthService,
    private reportService: ReportService,
    private router: Router
  ) {
    this.isManager = this.authService.isManager();
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.reportService.getStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.reservationsByType = stats.reservationsByRoomType || {};
        this.maxReservationsByType = Math.max(...Object.values(this.reservationsByType), 1);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getPercentage(value: number, max: number): number {
    return (value / max) * 100;
  }

  logout(): void {
    this.authService.logout();
  }
}
