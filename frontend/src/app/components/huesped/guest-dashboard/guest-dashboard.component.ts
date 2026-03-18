import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { DocumentService } from '../../../services/document.service';
import { Reservation } from '../../../models/reservation.model';
import { DocumentFile } from '../../../models/document.model';

@Component({
  selector: 'app-guest-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>Mi Dashboard</h1>
        <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
      </header>

      <main class="content">
        <div class="welcome-section">
          <h2>Bienvenido, {{ userName }}</h2>
          <p *ngIf="!hasReservation">¡Explora nuestras habitaciones y reserva tu próxima estadía!</p>
          <p *ngIf="hasReservation">Tienes una reserva activa. ¡Disfruta tu estadía!</p>
        </div>

        <div *ngIf="!hasReservation" class="cta-section">
          <button class="btn-primary" (click)="viewRooms()">
            Ver Habitaciones Disponibles
          </button>
        </div>

        <div *ngIf="hasReservation && myReservation" class="reservation-card">
          <h3>Mi Reserva</h3>
          <div class="reservation-details">
            <div class="detail">
              <span class="label">Habitación:</span>
              <span class="value">{{ myReservation.roomNumber }} ({{ myReservation.roomType }})</span>
            </div>
            <div class="detail">
              <span class="label">Check-in:</span>
              <span class="value">{{ myReservation.checkInDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail">
              <span class="label">Check-out:</span>
              <span class="value">{{ myReservation.checkOutDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail">
              <span class="label">Noches:</span>
              <span class="value">{{ myReservation.nights }}</span>
            </div>
            <div class="detail">
              <span class="label">Costo Total:</span>
              <span class="value">\${{ myReservation.totalCost | number:'1.2-2' }}</span>
            </div>
            <div class="detail">
              <span class="label">Estado:</span>
              <span class="status-badge" [class]="myReservation.status">{{ myReservation.status }}</span>
            </div>
          </div>
        </div>

        <!-- Sección de Documentos PDF -->
        <div class="documents-section">
          <h3>Mis Documentos PDF</h3>
          
          <div class="upload-section">
            <input 
              type="file" 
              #fileInput 
              (change)="onFileSelected($event)" 
              accept="application/pdf" 
              hidden
            >
            <div class="upload-area" (click)="fileInput.click()">
              <span>📄</span>
              <p>Click para seleccionar PDF</p>
            </div>
            <div *ngIf="selectedFile" class="file-preview">
              <span>{{ selectedFile.name }}</span>
              <button class="btn-upload" (click)="uploadFile()" [disabled]="uploading">
                {{ uploading ? 'Subiendo...' : 'Subir' }}
              </button>
            </div>
          </div>

          <div *ngIf="uploadError" class="error-msg">{{ uploadError }}</div>

          <table class="documents-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>PDF</th>
                <th>Visualizar</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of documents">
                <td>{{ doc.uploadDate | date:'dd/MM/yyyy' }}</td>
                <td>📄 {{ doc.fileName }}</td>
                <td>
                  <button class="btn-view" (click)="viewDocument(doc)">👁️</button>
                </td>
                <td>
                  <button class="btn-delete" (click)="deleteDocument(doc)">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="documents.length === 0">
                <td colspan="4" class="no-data">No hay documentos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PDF Viewer Modal -->
        <div *ngIf="showViewer" class="pdf-overlay" (click)="closeViewer()">
          <div class="pdf-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h4>{{ selectedDoc?.fileName }}</h4>
              <button class="btn-close" (click)="closeViewer()">✕</button>
            </div>
            <iframe [src]="pdfUrl" class="pdf-frame"></iframe>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard { min-height: 100vh; background: #f5f7fa; }
    .header { background: white; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header h1 { margin: 0; color: #333; }
    .btn-logout { padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .content { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .welcome-section { text-align: center; margin-bottom: 2rem; }
    .welcome-section h2 { color: #333; }
    .cta-section { text-align: center; margin-bottom: 2rem; }
    .btn-primary { padding: 1rem 2rem; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; }
    .reservation-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .reservation-card h3 { margin: 0 0 1.5rem 0; color: #333; }
    .reservation-details { display: grid; gap: 1rem; }
    .detail { display: flex; justify-content: space-between; padding: 0.75rem; background: #f8f9fa; border-radius: 6px; }
    .label { color: #666; font-weight: 500; }
    .value { color: #333; font-weight: 600; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; }
    .status-badge.confirmed { background: #d5f4e6; color: #27ae60; }
    .documents-section { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 2rem; }
    .documents-section h3 { margin: 0 0 1.5rem 0; color: #333; }
    .upload-section { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
    .upload-area { border: 2px dashed #ddd; border-radius: 8px; padding: 1rem 2rem; text-align: center; cursor: pointer; transition: all 0.3s; }
    .upload-area:hover { border-color: #667eea; }
    .file-preview { display: flex; align-items: center; gap: 0.5rem; }
    .btn-upload { padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .btn-upload:disabled { background: #ccc; }
    .error-msg { color: #e74c3c; padding: 0.5rem; background: #fadbd8; border-radius: 6px; margin-bottom: 1rem; }
    .documents-table { width: 100%; border-collapse: collapse; }
    .documents-table th, .documents-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee; }
    .documents-table th { background: #f8f9fa; font-weight: 600; }
    .btn-view, .btn-delete { padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.25rem; }
    .btn-view { background: #3498db; color: white; }
    .btn-delete { background: #e74c3c; color: white; }
    .no-data { text-align: center; color: #999; padding: 1rem !important; }
    .pdf-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .pdf-modal { background: white; border-radius: 12px; width: 90%; height: 90%; max-width: 900px; display: flex; flex-direction: column; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    .pdf-frame { flex: 1; border: none; }
  `]
})
export class GuestDashboardComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private documentService = inject(DocumentService);
  private router = inject(Router);

  userName = '';
  hasReservation = false;
  myReservation: Reservation | null = null;
  
  documents: DocumentFile[] = [];
  selectedFile: File | null = null;
  uploading = false;
  uploadError = '';
  showViewer = false;
  selectedDoc: DocumentFile | null = null;
  pdfUrl = '';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user?.fullName || 'Huésped';
    this.loadMyReservation();
    this.loadDocuments();
  }

  loadMyReservation(): void {
    this.reservationService.getMyReservation().subscribe({
      next: (reservation) => {
        if (reservation) {
          this.hasReservation = true;
          this.myReservation = reservation;
        }
      },
      error: (err) => console.error('Error loading reservation:', err)
    });
  }

  loadDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (docs) => this.documents = docs,
      error: (err) => console.error('Error loading documents:', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.uploadError = 'Solo se permiten archivos PDF';
        return;
      }
      this.uploadError = '';
      this.selectedFile = file;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.uploadError = '';
    this.documentService.uploadDocument(this.selectedFile).subscribe({
      next: () => {
        this.uploading = false;
        this.selectedFile = null;
        this.loadDocuments();
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err.error?.message || 'Error al subir';
      }
    });
  }

  viewDocument(doc: DocumentFile): void {
    this.selectedDoc = doc;
    this.pdfUrl = doc.fileUrl;
    this.showViewer = true;
  }

  closeViewer(): void {
    this.showViewer = false;
    this.selectedDoc = null;
    this.pdfUrl = '';
  }

  deleteDocument(doc: DocumentFile): void {
    if (confirm(`¿Eliminar "${doc.fileName}"?`)) {
      this.documentService.deleteDocument(doc.id).subscribe({
        next: () => this.loadDocuments(),
        error: (err) => alert(err.error?.message || 'Error al eliminar')
      });
    }
  }

  viewRooms(): void { this.router.navigate(['/guest/rooms']); }
  logout(): void { this.authService.logout(); this.router.navigate(['/']); }
}
