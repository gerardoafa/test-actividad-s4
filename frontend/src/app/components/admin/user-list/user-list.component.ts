import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GuestService } from '../../../services/guest.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>Administración de Usuarios</h1>
        <div class="user-info">
          <span>Bienvenido, {{ userName }}</span>
          <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>

      <main class="content">
        <div class="tabs">
          <button 
            class="tab" 
            [class.active]="activeTab === 'all'"
            (click)="activeTab = 'all'"
          >
            Todos los Usuarios
          </button>
          <button 
            class="tab" 
            [class.active]="activeTab === 'gerentes'"
            (click)="activeTab = 'gerentes'"
          >
            Gerentes
          </button>
          <button 
            class="tab" 
            [class.active]="activeTab === 'huespedes'"
            (click)="activeTab = 'huespedes'"
          >
            Huéspedes
          </button>
        </div>

        <div class="users-section">
          <div class="stats">
            <div class="stat">
              <span class="stat-number">{{ getTotalUsers() }}</span>
              <span class="stat-label">Total Usuarios</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ getGerentesCount() }}</span>
              <span class="stat-label">Gerentes</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ getHuespedesCount() }}</span>
              <span class="stat-label">Huéspedes</span>
            </div>
          </div>

          <table class="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Reserva Activa</th>
                <th>Fecha de Registro</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of getFilteredUsers()">
                <td>
                  <div class="user-name">
                    <span class="avatar">{{ getInitials(user.fullName) }}</span>
                    {{ user.fullName }}
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" [class]="getRoleClass(user.role)">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span class="reservation-status" [class.has-reservation]="user.hasReserved">
                    {{ user.hasReserved ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td>{{ user.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span class="status-badge active">Activo</span>
                </td>
              </tr>
              <tr *ngIf="getFilteredUsers().length === 0">
                <td colspan="6" class="no-data">No hay usuarios para mostrar</td>
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
      font-size: 1.5rem;
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
    .content {
      padding: 2rem;
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
    .users-section {
      background: white;
      border-radius: 0 12px 12px 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
    }
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
    .users-table {
      width: 100%;
      border-collapse: collapse;
    }
    .users-table th, .users-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .users-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    .user-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar {
      width: 36px;
      height: 36px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .role-badge.admin {
      background: #e74c3c;
      color: white;
    }
    .role-badge.gerente {
      background: #f39c12;
      color: white;
    }
    .role-badge.huesped {
      background: #3498db;
      color: white;
    }
    .reservation-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      background: #fef3cd;
      color: #f39c12;
    }
    .reservation-status.has-reservation {
      background: #d5f4e6;
      color: #27ae60;
    }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .status-badge.active {
      background: #d5f4e6;
      color: #27ae60;
    }
    .no-data {
      text-align: center;
      color: #999;
      padding: 2rem !important;
    }
  `]
})
export class UserListComponent implements OnInit {
  private authService = inject(AuthService);
  private guestService = inject(GuestService);
  private router = inject(Router);

  users: User[] = [];
  userName = '';
  activeTab: 'all' | 'gerentes' | 'huespedes' = 'all';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user?.fullName || 'Admin';
    this.loadUsers();
  }

  loadUsers(): void {
    this.guestService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: (err) => console.error('Error loading users:', err)
    });
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getGerentesCount(): number {
    return this.users.filter(u => u.role === 'Gerente' || u.role === 'gerente').length;
  }

  getHuespedesCount(): number {
    return this.users.filter(u => u.role === 'Huésped' || u.role === 'user').length;
  }

  getFilteredUsers(): User[] {
    switch (this.activeTab) {
      case 'gerentes':
        return this.users.filter(u => u.role === 'Gerente' || u.role === 'gerente');
      case 'huespedes':
        return this.users.filter(u => u.role === 'Huésped' || u.role === 'user');
      default:
        return this.users;
    }
  }

  getRoleClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'gerente':
        return 'gerente';
      default:
        return 'huesped';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
