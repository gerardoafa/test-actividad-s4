import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GuestService } from '../../services/guest.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="guests-page">
      <header class="header">
        <h1>Gestión de Huéspedes</h1>
        <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
      </header>

      <nav class="nav-bar">
        <a routerLink="/manager/dashboard" class="nav-link">Dashboard</a>
        <a routerLink="/manager/rooms" class="nav-link">Habitaciones</a>
        <a routerLink="/manager/guests" class="nav-link active">Huéspedes</a>
        <a routerLink="/manager/reports" class="nav-link">Reportes</a>
      </nav>

      <div class="content">
        <div *ngIf="loading" class="loading">Cargando huéspedes...</div>

        <div *ngIf="!loading && guests.length === 0" class="no-guests">
          No hay huéspedes registrados
        </div>

        <div *ngIf="!loading && guests.length > 0" class="guests-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado de Reserva</th>
                <th>Habitación</th>
                <th>Fechas</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let guest of guests">
                <td>{{ guest.fullName }}</td>
                <td>{{ guest.email }}</td>
                <td>
                  <span class="status" [class.has-reserved]="guest.hasReserved" [class.no-reserve]="!guest.hasReserved">
                    {{ guest.hasReserved ? 'Reservado' : 'Sin reserva' }}
                  </span>
                </td>
                <td>{{ guest.reservedRoom || '-' }}</td>
                <td>{{ guest.reservedDates || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .guests-page {
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
    .loading, .no-guests {
      text-align: center;
      padding: 3rem;
      color: #777;
    }
    .guests-table {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 1rem;
      text-align: left;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    td {
      border-top: 1px solid #eee;
    }
    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
    }
    .status.has-reserved {
      background: #d4edda;
      color: #155724;
    }
    .status.no-reserve {
      background: #fff3cd;
      color: #856404;
    }
  `]
})
export class GuestListComponent implements OnInit {
  guests: User[] = [];
  loading = true;

  constructor(
    private guestService: GuestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests(): void {
    this.guestService.getAllGuests().subscribe({
      next: (guests) => {
        this.guests = guests;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
