import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="rooms-page">
      <header class="header">
        <h1>Gestión de Habitaciones</h1>
        <button (click)="logout()" class="btn-logout">Cerrar Sesión</button>
      </header>

      <nav class="nav-bar">
        <a routerLink="/manager/dashboard" class="nav-link">Dashboard</a>
        <a routerLink="/manager/rooms" class="nav-link active">Habitaciones</a>
        <a routerLink="/manager/guests" class="nav-link">Huéspedes</a>
        <a routerLink="/manager/reports" class="nav-link">Reportes</a>
      </nav>

      <div class="content">
        <div class="actions-bar">
          <button (click)="showForm = true" class="btn-add">+ Nueva Habitación</button>
        </div>

        <div *ngIf="showForm" class="form-card">
          <h3>{{ editingRoom ? 'Editar' : 'Nueva' }} Habitación</h3>
          <form (ngSubmit)="saveRoom()">
            <div class="form-row">
              <div class="form-group">
                <label>Número de Habitación</label>
                <input type="text" [(ngModel)]="roomForm.roomNumber" name="roomNumber" required>
              </div>
              <div class="form-group">
                <label>Tipo</label>
                <select [(ngModel)]="roomForm.type" name="type" required>
                  <option value="">Seleccionar tipo</option>
                  <option value="Estándar">Estándar</option>
                  <option value="Suite">Suite</option>
                  <option value="Junior Suite">Junior Suite</option>
                  <option value="Suite Deluxe">Suite Deluxe</option>
                  <option value="Familiar">Familiar</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Capacidad</label>
                <input type="number" [(ngModel)]="roomForm.capacity" name="capacity" min="1" required>
              </div>
              <div class="form-group">
                <label>Precio por Noche</label>
                <input type="number" [(ngModel)]="roomForm.basePricePerNight" name="price" min="0" step="0.01" required>
              </div>
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="roomForm.description" name="description" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" (click)="cancelForm()" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-save" [disabled]="saving">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="loading" class="loading">Cargando habitaciones...</div>

        <div *ngIf="!loading" class="rooms-table">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Capacidad</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Reservas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let room of rooms">
                <td>{{ room.roomNumber }}</td>
                <td>{{ room.type }}</td>
                <td>{{ room.capacity }}</td>
                <td>\${{ room.basePricePerNight }}</td>
                <td>
                  <span class="status" [class.available]="room.isAvailable" [class.unavailable]="!room.isAvailable">
                    {{ room.isAvailable ? 'Disponible' : 'No disponible' }}
                  </span>
                </td>
                <td>{{ room.reservationCount || 0 }}</td>
                <td>
                  <button (click)="editRoom(room)" class="btn-edit">Editar</button>
                  <button (click)="toggleAvailability(room)" class="btn-toggle">
                    {{ room.isAvailable ? 'Deshabilitar' : 'Habilitar' }}
                  </button>
                  <button (click)="deleteRoom(room)" class="btn-delete">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rooms-page {
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
    .actions-bar {
      margin-bottom: 1.5rem;
    }
    .btn-add {
      padding: 0.75rem 1.5rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
    }
    .form-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .form-card h3 {
      margin: 0 0 1rem 0;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    .btn-cancel, .btn-save {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .btn-cancel {
      background: #95a5a6;
      color: white;
    }
    .btn-save {
      background: #667eea;
      color: white;
    }
    .loading {
      text-align: center;
      padding: 3rem;
      color: #777;
    }
    .rooms-table {
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
    .status.available {
      background: #d4edda;
      color: #155724;
    }
    .status.unavailable {
      background: #f8d7da;
      color: #721c24;
    }
    .btn-edit, .btn-toggle, .btn-delete {
      padding: 0.4rem 0.75rem;
      margin-right: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-edit {
      background: #ffc107;
      color: #000;
    }
    .btn-toggle {
      background: #17a2b8;
      color: #fff;
    }
    .btn-delete {
      background: #dc3545;
      color: #fff;
    }
  `]
})
export class RoomManagementComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  showForm = false;
  editingRoom: Room | null = null;
  saving = false;

  roomForm: Partial<Room> = {
    roomNumber: '',
    type: '',
    capacity: 1,
    basePricePerNight: 0,
    description: '',
    isAvailable: true
  };

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  editRoom(room: Room): void {
    this.editingRoom = room;
    this.roomForm = { ...room };
    this.showForm = true;
  }

  saveRoom(): void {
    this.saving = true;
    const data = {
      ...this.roomForm,
      baseRate: this.roomForm.basePricePerNight
    };

    const request = this.editingRoom
      ? this.roomService.updateRoom(this.editingRoom.id, data)
      : this.roomService.createRoom(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.cancelForm();
        this.loadRooms();
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  toggleAvailability(room: Room): void {
    this.roomService.updateRoom(room.id, { isAvailable: !room.isAvailable }).subscribe({
      next: () => this.loadRooms()
    });
  }

  deleteRoom(room: Room): void {
    if (confirm(`¿Eliminar habitación ${room.roomNumber}?`)) {
      this.roomService.deleteRoom(room.id).subscribe({
        next: () => this.loadRooms()
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingRoom = null;
    this.roomForm = {
      roomNumber: '',
      type: '',
      capacity: 1,
      basePricePerNight: 0,
      description: '',
      isAvailable: true
    };
  }

  logout(): void {
    this.authService.logout();
  }
}
