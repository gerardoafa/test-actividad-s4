import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="header">
        <h1>Reportes</h1>
        <button class="btn-back" (click)="goBack()">← Volver</button>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total de Habitaciones</h3>
          <p class="stat-number">{{ statistics.totalRooms }}</p>
        </div>
        <div class="stat-card">
          <h3>Reservas Totales</h3>
          <p class="stat-number">{{ statistics.totalReservations }}</p>
        </div>
        <div class="stat-card">
          <h3>Ingresos Totales</h3>
          <p class="stat-number">\${{ statistics.totalRevenue | number:'1.2-2' }}</p>
        </div>
        <div class="stat-card">
          <h3>Tasa de Ocupación</h3>
          <p class="stat-number">{{ statistics.occupancyRate | number:'1.1-1' }}%</p>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <h3>Resumen de Ocupación</h3>
          <div class="chart-placeholder">
            <p>Habitaciones: {{ statistics.totalRooms }}</p>
            <p>Disponibles: {{ statistics.availableRooms }}</p>
            <div class="progress-bar">
              <div class="progress" [style.width.%]="100 - statistics.occupancyRate"></div>
            </div>
            <p class="caption">% de ocupación: {{ statistics.occupancyRate | number:'1.1-1' }}%</p>
          </div>
        </div>

        <div class="chart-card">
          <h3>Ingresos por Tipo de Habitación</h3>
          <div class="chart-placeholder">
            <p>Total: \${{ statistics.totalRevenue | number:'1.2-2' }}</p>
            <div class="info-box">
              <p>Los ingresos se calculan basándose en todas las reservas confirmadas.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="export-section">
        <h3>Exportar Reportes</h3>
        <div class="export-buttons">
          <button class="btn-export" (click)="exportReport('pdf')">
            📄 Exportar PDF
          </button>
          <button class="btn-export" (click)="exportReport('excel')">
            📊 Exportar Excel
          </button>
        </div>
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
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .chart-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .chart-card h3 {
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .chart-placeholder {
      text-align: center;
      color: #666;
    }
    .progress-bar {
      width: 100%;
      height: 20px;
      background: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      margin: 1rem 0;
    }
    .progress {
      height: 100%;
      background: #667eea;
      transition: width 0.3s;
    }
    .caption {
      font-size: 0.9rem;
      color: #999;
    }
    .info-box {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }
    .export-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .export-section h3 {
      margin-top: 0;
    }
    .export-buttons {
      display: flex;
      gap: 1rem;
    }
    .btn-export {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private router = inject(Router);

  statistics = {
    totalRooms: 0,
    totalReservations: 0,
    totalRevenue: 0,
    availableRooms: 0,
    occupancyRate: 0
  };

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.reportService.getStatistics().subscribe({
      next: (data) => {
        this.statistics = {
          totalRooms: data.totalRooms || 0,
          totalReservations: data.totalReservations || 0,
          totalRevenue: data.totalRevenue || 0,
          availableRooms: data.availableRooms || 0,
          occupancyRate: data.occupancyRate || 0
        };
      },
      error: (err) => console.error('Error loading statistics:', err)
    });
  }

  exportReport(format: string): void {
    alert(`Exportando reporte en formato ${format.toUpperCase()}...`);
  }

  goBack(): void {
    this.router.navigate(['/manager/dashboard']);
  }
}
