import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing">
      <header class="header">
        <div class="logo">Hotel Management</div>
        <nav>
          <a routerLink="/login" class="btn">Iniciar Sesión</a>
          <a routerLink="/register" class="btn btn-primary">Registrarse</a>
        </nav>
      </header>

      <section class="hero">
        <h1>Bienvenido a Hotel Management</h1>
        <p>La mejor experiencia de reservas hoteleras</p>
        <a routerLink="/register" class="btn btn-large">Comenzar Ahora</a>
      </section>

      <section class="features">
        <div class="feature">
          <h3>🏨 Habitaciones</h3>
          <p>Explora nuestra amplia variedad de habitaciones disponibles</p>
        </div>
        <div class="feature">
          <h3>📅 Reservas Fáciles</h3>
          <p>Reserva tu habitación en simples pasos</p>
        </div>
        <div class="feature">
          <h3>📊 Dashboard</h3>
          <p>Gestiona tu reservas y ve estadísticas en tiempo real</p>
        </div>
      </section>

      <footer class="footer">
        <p>&copy; 2026 Hotel Management. Todos los derechos reservados.</p>
      </footer>
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
      padding: 1rem 2rem;
      background: rgba(0,0,0,0.2);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    nav {
      display: flex;
      gap: 1rem;
    }
    .btn {
      padding: 0.5rem 1.5rem;
      border-radius: 5px;
      text-decoration: none;
      color: white;
      border: 1px solid white;
      transition: all 0.3s;
    }
    .btn:hover {
      background: white;
      color: #667eea;
    }
    .btn-primary {
      background: #ff6b6b;
      border: none;
    }
    .btn-primary:hover {
      background: #ee5a5a;
      color: white;
    }
    .btn-large {
      padding: 1rem 3rem;
      font-size: 1.2rem;
      background: #ff6b6b;
      border: none;
      display: inline-block;
    }
    .hero {
      text-align: center;
      padding: 5rem 2rem;
    }
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .hero p {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .features {
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding: 4rem 2rem;
      flex-wrap: wrap;
    }
    .feature {
      background: rgba(255,255,255,0.1);
      padding: 2rem;
      border-radius: 10px;
      text-align: center;
      max-width: 300px;
    }
    .feature h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    .footer {
      text-align: center;
      padding: 2rem;
      background: rgba(0,0,0,0.2);
    }
  `]
})
export class LandingComponent {}
