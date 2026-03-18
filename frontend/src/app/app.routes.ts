import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { 
    path: 'landing', 
    loadComponent: () => import('./components/public/landing/landing.component').then(m => m.LandingComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/public/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/public/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'manager',
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/gerente/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      { 
        path: 'rooms', 
        loadComponent: () => import('./components/gerente/room-management/room-management.component').then(m => m.RoomManagementComponent)
      },
      { 
        path: 'rooms/new', 
        loadComponent: () => import('./components/gerente/room-form/room-form.component').then(m => m.RoomFormComponent)
      },
      { 
        path: 'rooms/edit/:id', 
        loadComponent: () => import('./components/gerente/room-form/room-form.component').then(m => m.RoomFormComponent)
      },
      { 
        path: 'guests', 
        loadComponent: () => import('./components/gerente/guest-list/guest-list.component').then(m => m.GuestListComponent)
      },
      { 
        path: 'reports', 
        loadComponent: () => import('./components/gerente/reports/reports.component').then(m => m.ReportsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'guest',
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/huesped/guest-dashboard/guest-dashboard.component').then(m => m.GuestDashboardComponent)
      },
      { 
        path: 'rooms', 
        loadComponent: () => import('./components/huesped/rooms-list/rooms-list.component').then(m => m.RoomsListComponent)
      },
      { 
        path: 'reservation/:id', 
        loadComponent: () => import('./components/huesped/reservation/reservation.component').then(m => m.ReservationComponent)
      },
      { 
        path: 'reservation/confirmation/:id', 
        loadComponent: () => import('./components/huesped/reservation-confirmation/reservation-confirmation.component').then(m => m.ReservationConfirmationComponent)
      },
      { 
        path: 'already-reserved', 
        loadComponent: () => import('./components/huesped/already-reserved/already-reserved.component').then(m => m.AlreadyReservedComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    children: [
      { 
        path: 'users', 
        loadComponent: () => import('./components/admin/user-list/user-list.component').then(m => m.UserListComponent)
      },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'landing' }
];
