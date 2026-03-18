import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GuestService } from '../../../services/guest.service';
import { ReservationService } from '../../../services/reservation.service';
import { User } from '../../../models/user.model';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-guest-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="header">
        <h1>Lista de Huéspedes</h1>
        <button class="btn-back" (click)="goBack()">← Volver</button>
      </header>

      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab === 'guests'"
          (click)="activeTab = 'guests'"
        >
          Huéspedes
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'reservations'"
          (click)="activeTab = 'reservations'"
        >
          Reservas
        </button>
      </div>

      <div *ngIf="activeTab === 'guests'" class="content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado de Reserva</th>
              <th>Habitación</th>
              <th>Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let guest of guests">
              <td>{{ guest.fullName }}</td>
              <td>{{ guest.email }}</td>
              <td>
                <span class="badge" [class.has-reservation]="guest.hasReserved" [class.no-reservation]="!guest.hasReserved">
                  {{ guest.hasReserved ? 'Con Reserva' : 'Sin Reserva' }}
                </span>
              </td>
              <td>{{ guest.reservedRoom || '-' }}</td>
              <td>{{ guest.createdAt | date:'dd/MM/yyyy' }}</td>
            </tr>
            <tr *ngIf="guests.length === 0">
              <td colspan="5" class="no-data">No hay huéspedes registrados</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="activeTab === 'reservations'" class="content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Tipo</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Noches</th>
              <th>Costo Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let res of reservations">
              <td>{{ res.userName }}</td>
              <td>{{ res.roomNumber }}</td>
              <td>{{ res.roomType }}</td>
              <td>{{ res.checkInDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ res.checkOutDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ res.nights }}</td>
              <td>\${{ res.totalCost | number:'1.2-2' }}</td>
              <td>
                <span class="status-badge" [class]="res.status">{{ res.status }}</span>
              </td>
            </tr>
            <tr *ngIf="reservations.length === 0">
              <td colspan="8" class="no-data">No hay reservas realizadas</td>
            </tr>
          </tbody>
        </table>
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
    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .tab {
      padding: 0.75rem 1.5rem;
      background: white;
      border: none;
      border-radius: 6px 6px 0 0;
      cursor: pointer;
      color: #666;
      transition: all 0.3s;
    }
    .tab.active {
      background: #667eea;
      color: white;
    }
    .content {
      background: white;
      border-radius: 0 12px 12px 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .badge.has-reservation {
      background: #d5f4e6;
      color: #27ae60;
    }
    .badge.no-reservation {
      background: #fef3cd;
      color: #f39c12;
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
export class GuestListComponent implements OnInit {
  private guestService = inject(GuestService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  guests: User[] = [];
  reservations: Reservation[] = [];
  activeTab: 'guests' | 'reservations' = 'guests';

  ngOnInit(): void {
    this.loadGuests();
    this.loadReservations();
  }

  loadGuests(): void {
    this.guestService.getAllGuests().subscribe({
      next: (guests) => this.guests = guests,
      error: (err) => console.error('Error loading guests:', err)
    });
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => this.reservations = reservations,
      error: (err) => console.error('Error loading reservations:', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/manager/dashboard']);
  }
}
