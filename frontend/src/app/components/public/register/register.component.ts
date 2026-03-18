import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="register-container">
      <div class="register-box">
        <h2>Crear Cuenta</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="fullName">Nombre Completo</label>
            <input 
              type="text" 
              id="fullName" 
              [(ngModel)]="fullName" 
              name="fullName" 
              required
              placeholder="Ingresa tu nombre completo"
            >
          </div>
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
              placeholder="Crea una contraseña"
            >
          </div>
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          <button type="submit" class="btn-register" [disabled]="loading">
            {{ loading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </form>
        <p class="login-link">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a>
        </p>
        <p class="back-link">
          <a routerLink="/">Volver al inicio</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }
    .register-box {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    .register-box h2 {
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
    .success-message {
      color: #27ae60;
      text-align: center;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #d5f4e6;
      border-radius: 6px;
    }
    .btn-register {
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
    .btn-register:hover:not(:disabled) {
      background: #5568d3;
    }
    .btn-register:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .login-link, .back-link {
      text-align: center;
      margin-top: 1.5rem;
    }
    .login-link a, .back-link a {
      color: #667eea;
      text-decoration: none;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register({ 
      email: this.email, 
      password: this.password, 
      fullName: this.fullName 
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '¡Registro exitoso! Ahora puedes iniciar sesión.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al registrar usuario';
      }
    });
  }
}
