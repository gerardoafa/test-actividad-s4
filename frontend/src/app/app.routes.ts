import { Routes } from '@angular/router';
import { LandingComponent } from './components/public/landing.component';
import { LoginComponent } from './components/public/login.component';
import { RegisterComponent } from './components/public/register.component';
import { GuestDashboardComponent } from './components/guest/guest-dashboard.component';
import { RoomsListComponent } from './components/guest/rooms-list.component';
import { ReservationComponent } from './components/guest/reservation.component';
import { ManagerDashboardComponent } from './components/manager/manager-dashboard.component';
import { RoomManagementComponent } from './components/manager/room-management.component';
import { GuestListComponent } from './components/manager/guest-list.component';
import { ReportsComponent } from './components/manager/reports.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'guest', 
    children: [
      { path: 'dashboard', component: GuestDashboardComponent },
      { path: 'rooms', component: RoomsListComponent },
      { path: 'reservation/:id', component: ReservationComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { 
    path: 'manager', 
    children: [
      { path: 'dashboard', component: ManagerDashboardComponent },
      { path: 'rooms', component: RoomManagementComponent },
      { path: 'guests', component: GuestListComponent },
      { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
