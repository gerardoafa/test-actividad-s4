import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <div class="landing">
      <header class="header">
        <div class="logo">Hotel Management</div>
        <nav class="nav">
          <a href="#" (click)="navigateToLogin($event)">Iniciar Sesión</a>
          <a href="#" (click)="navigateToRegister($event)">Registrarse</a>
        </nav>
      </header>

      <main class="hero">
        <h1>Bienvenido a Hotel Management</h1>
        <p>La mejor experiencia de reserva de habitaciones de hotel</p>
        <div class="cta-buttons">
          <button class="btn-primary" (click)="navigateToLogin($event)">Iniciar Sesión</button>
          <button class="btn-secondary" (click)="navigateToRegister($event)">Registrarse</button>
        </div>
      </main>

      <section class="features">
        <div class="feature">
          <h3>🏨 Habitaciones Variadas</h3>
          <p>Encuentra la habitación perfecta para tu estadía</p>
        </div>
        <div class="feature">
          <h3>📅 Reserva Fácil</h3>
          <p>Reserva en solo unos clics</p>
        </div>
        <div class="feature">
          <h3>⭐ Calificaciones</h3>
          <p>Verifica las opiniones de otros huéspedes</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 3rem;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .nav a {
      color: white;
      text-decoration: none;
      margin-left: 1.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid white;
      border-radius: 4px;
      transition: background 0.3s;
    }
    .nav a:hover {
      background: white;
      color: #667eea;
    }
    .hero {
      text-align: center;
      padding: 4rem 2rem;
    }
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .hero p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
    }
    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-primary, .btn-secondary {
      padding: 1rem 2rem;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-primary {
      background: white;
      color: #667eea;
    }
    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }
    .btn-primary:hover, .btn-secondary:hover {
      transform: scale(1.05);
    }
    .features {
      display: flex;
      justify-content: space-around;
      padding: 4rem 2rem;
      background: rgba(255,255,255,0.1);
    }
    .feature {
      text-align: center;
      padding: 2rem;
    }
    .feature h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
  `]
})
export class LandingComponent {
  constructor(private router: Router, private authService: AuthService) {
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }
  }

  navigateToLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  navigateToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  private redirectByRole(): void {
    const user = this.authService.getCurrentUser();
    if (user?.role === 'Gerente') {
      this.router.navigate(['/manager/dashboard']);
    } else if (user?.role === 'Admin') {
      this.router.navigate(['/admin/users']);
    } else {
      this.router.navigate(['/guest/dashboard']);
    }
  }
}
