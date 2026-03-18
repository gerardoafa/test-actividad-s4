import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Crear Cuenta</h2>
        <form (ngSubmit)="onRegister()">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" [(ngModel)]="fullName" name="fullName" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required>
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" required>
          </div>
          <div class="form-group">
            <label>Tipo de Cuenta</label>
            <select [(ngModel)]="role" name="role" (change)="onRoleChange()">
              <option value="user">Huésped</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>
          <div class="form-group" *ngIf="role === 'gerente'">
            <label>Clave Secreta</label>
            <input type="password" [(ngModel)]="secretKey" name="secretKey" placeholder="Ingresa la clave secreta">
          </div>
          <div *ngIf="error" class="error">{{ error }}</div>
          <div *ngIf="success" class="success">{{ success }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>
        <p class="switch-auth">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia Sesión</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 1.5rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
    }
    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .error {
      color: #e74c3c;
      margin-bottom: 1rem;
      text-align: center;
    }
    .success {
      color: #27ae60;
      margin-bottom: 1rem;
      text-align: center;
    }
    .switch-auth {
      text-align: center;
      margin-top: 1rem;
      color: #555;
    }
    .switch-auth a {
      color: #667eea;
      text-decoration: none;
    }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  role = 'user';
  secretKey = '';
  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRoleChange(): void {
    if (this.role !== 'gerente') {
      this.secretKey = '';
    }
  }

  onRegister(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const request: any = {
      email: this.email,
      password: this.password,
      fullName: this.fullName,
      role: this.role
    };

    if (this.role === 'gerente') {
      request.secretKey = this.secretKey;
    }

    this.authService.register(request).subscribe({
      next: () => {
        this.loading = false;
        this.success = '¡Registro exitoso! Redirigiendo...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al registrarse';
      }
    });
  }
}
