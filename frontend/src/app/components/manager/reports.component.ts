import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { AuthService } from '../../services/auth.service';
import { ReservationStatistics } from '../../models/statistics.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reports-page">
      <header class="header">
        <h1>Reportes y Estadísticas</h1>
        <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
      </header>

      <nav class="nav-bar">
        <a routerLink="/manager/dashboard" class="nav-link">Dashboard</a>
        <a routerLink="/manager/rooms" class="nav-link">Habitaciones</a>
        <a routerLink="/manager/guests" class="nav-link">Huéspedes</a>
        <a routerLink="/manager/reports" class="nav-link active">Reportes</a>
      </nav>

      <div class="content">
        <div *ngIf="loading" class="loading">Cargando reportes...</div>

        <div *ngIf="!loading && stats" class="reports-grid">
          <div class="report-card">
            <h3>Resumen General</h3>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-label">Total Habitaciones:</span>
                <span class="stat-value">{{ stats.totalRooms }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Noches Reservadas:</span>
                <span class="stat-value">{{ stats.totalNightsReserved }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Porcentaje de Ocupación:</span>
                <span class="stat-value">{{ stats.occupancyPercentage | number:'1.1-1' }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Ingresos Totales:</span>
                <span class="stat-value">\${{ stats.totalRevenue | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <div class="report-card">
            <h3>Reservas por Tipo de Habitación</h3>
            <div class="chart-container">
              <canvas #reservationsChart></canvas>
            </div>
          </div>

          <div class="report-card full-width">
            <h3>Ingresos por Período</h3>
            <div class="chart-container">
              <canvas #revenueChart></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page {
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
      color: #777;
    }
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    .report-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .report-card.full-width {
      grid-column: span 2;
    }
    .report-card h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }
    .summary-stats {
      display: grid;
      gap: 1rem;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 5px;
    }
    .stat-label {
      color: #555;
    }
    .stat-value {
      font-weight: bold;
      color: #333;
    }
    .chart-container {
      position: relative;
      height: 300px;
    }
    @media (max-width: 768px) {
      .reports-grid {
        grid-template-columns: 1fr;
      }
      .report-card.full-width {
        grid-column: span 1;
      }
    }
  `]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('reservationsChart') reservationsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;

  stats: ReservationStatistics | null = null;
  loading = true;
  private reservationsChart: Chart | null = null;
  private revenueChart: Chart | null = null;

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngAfterViewInit(): void {}

  loadStatistics(): void {
    this.reportService.getStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        setTimeout(() => this.createCharts(), 100);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createCharts(): void {
    if (!this.stats) return;

    if (this.reservationsChartRef?.nativeElement) {
      const reservationsData = this.stats.reservationsByRoomType;
      this.reservationsChart = new Chart(this.reservationsChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(reservationsData),
          datasets: [{
            data: Object.values(reservationsData),
            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    if (this.revenueChartRef?.nativeElement) {
      const revenueData = this.stats.revenueByPeriod;
      this.revenueChart = new Chart(this.revenueChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: Object.keys(revenueData),
          datasets: [{
            label: 'Ingresos',
            data: Object.values(revenueData),
            backgroundColor: '#667eea'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
