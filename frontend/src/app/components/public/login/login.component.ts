import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>Iniciar Sesión</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email" 
              required
              placeholder="Ingresa tu email"
            >
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password" 
              required
              placeholder="Ingresa tu contraseña"
            >
          </div>
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <button type="submit" class="btn-login" [disabled]="loading">
            {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
          </button>
        </form>
        <p class="register-link">
          ¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a>
        </p>
        <p class="back-link">
          <a routerLink="/">Volver al inicio</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-box {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    .login-box h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .error-message {
      color: #e74c3c;
      text-align: center;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #fadbd8;
      border-radius: 6px;
    }
    .btn-login {
      width: 100%;
      padding: 0.875rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    .btn-login:hover:not(:disabled) {
      background: #5568d3;
    }
    .btn-login:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .register-link, .back-link {
      text-align: center;
      margin-top: 1.5rem;
    }
    .register-link a, .back-link a {
      color: #667eea;
      text-decoration: none;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa email y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.redirectByRole(response.user?.role);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión';
      }
    });
  }

  private redirectByRole(role?: string): void {
    if (role === 'Gerente') {
      this.router.navigate(['/manager/dashboard']);
    } else if (role === 'Admin') {
      this.router.navigate(['/admin/users']);
    } else {
      this.router.navigate(['/guest/dashboard']);
    }
  }
}
