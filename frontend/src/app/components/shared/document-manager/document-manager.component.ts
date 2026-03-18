import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../services/document.service';
import { DocumentFile } from '../../../models/document.model';

@Component({
  selector: 'app-document-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="document-manager">
      <header class="header">
        <h2>Mis Documentos PDF</h2>
      </header>

      <div class="upload-section">
        <div class="upload-area" 
             (dragover)="onDragOver($event)" 
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             [class.dragover]="isDragging">
          <input 
            type="file" 
            #fileInput 
            (change)="onFileSelected($event)" 
            accept="application/pdf" 
            hidden
          >
          <div class="upload-content" (click)="fileInput.click()">
            <span class="upload-icon">📄</span>
            <p>Arrastra un archivo PDF aquí o haz clic para seleccionar</p>
            <p class="file-info" *ngIf="selectedFile">
              {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </p>
          </div>
        </div>
        <button class="btn-upload" 
                (click)="uploadFile()" 
                [disabled]="!selectedFile || uploading">
          {{ uploading ? 'Subiendo...' : 'Subir PDF' }}
        </button>
      </div>

      <div *ngIf="uploadError" class="error-message">
        {{ uploadError }}
      </div>

      <div class="documents-table">
        <table>
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
              <td>{{ doc.uploadDate | date:'dd/MM/yyyy HH:mm' }}</td>
              <td class="file-name">
                <span class="pdf-icon">📄</span>
                {{ doc.fileName }}
              </td>
              <td>
                <button class="btn-view" (click)="viewDocument(doc)">
                  👁️ Ver
                </button>
              </td>
              <td>
                <button class="btn-delete" (click)="deleteDocument(doc)">
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
            <tr *ngIf="documents.length === 0">
              <td colspan="4" class="no-data">
                No hay documentos subidos
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="showViewer" class="pdf-viewer-overlay" (click)="closeViewer()">
        <div class="pdf-viewer" (click)="$event.stopPropagation()">
          <div class="viewer-header">
            <h3>{{ selectedDocument?.fileName }}</h3>
            <button class="btn-close" (click)="closeViewer()">✕</button>
          </div>
          <iframe [src]="pdfUrl" class="pdf-frame"></iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-manager {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }
    .upload-section {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .upload-area {
      flex: 1;
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .upload-area.dragover {
      border-color: #667eea;
      background: #f0f4ff;
    }
    .upload-content {
      pointer-events: none;
    }
    .upload-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    .upload-area p {
      margin: 0.25rem 0;
      color: #666;
    }
    .file-info {
      color: #667eea !important;
      font-weight: 500;
    }
    .btn-upload {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-upload:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .error-message {
      color: #e74c3c;
      padding: 0.75rem;
      background: #fadbd8;
      border-radius: 6px;
      margin-bottom: 1.5rem;
    }
    .documents-table {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    .file-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .pdf-icon {
      font-size: 1.25rem;
    }
    .btn-view, .btn-delete {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .btn-view {
      background: #3498db;
      color: white;
    }
    .btn-delete {
      background: #e74c3c;
      color: white;
    }
    .no-data {
      text-align: center;
      color: #999;
      padding: 2rem !important;
    }
    .pdf-viewer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .pdf-viewer {
      background: white;
      border-radius: 12px;
      width: 90%;
      height: 90%;
      max-width: 900px;
      display: flex;
      flex-direction: column;
    }
    .viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .viewer-header h3 {
      margin: 0;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    .pdf-frame {
      flex: 1;
      border: none;
    }
  `]
})
export class DocumentManagerComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private documentService = inject(DocumentService);

  documents: DocumentFile[] = [];
  selectedFile: File | null = null;
  uploading = false;
  uploadError = '';
  isDragging = false;
  showViewer = false;
  selectedDocument: DocumentFile | null = null;
  pdfUrl = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (docs) => this.documents = docs,
      error: (err) => console.error('Error loading documents:', err)
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.uploadError = 'Solo se permiten archivos PDF';
      return;
    }
    this.uploadError = '';
    this.selectedFile = file;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadError = '';

    this.documentService.uploadDocument(this.selectedFile).subscribe({
      next: (doc) => {
        this.uploading = false;
        this.selectedFile = null;
        this.loadDocuments();
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err.error?.message || 'Error al subir el documento';
      }
    });
  }

  viewDocument(doc: DocumentFile): void {
    this.selectedDocument = doc;
    this.pdfUrl = doc.fileUrl;
    this.showViewer = true;
  }

  closeViewer(): void {
    this.showViewer = false;
    this.selectedDocument = null;
    this.pdfUrl = '';
  }

  deleteDocument(doc: DocumentFile): void {
    if (confirm(`¿Estás seguro de eliminar "${doc.fileName}"?`)) {
      this.documentService.deleteDocument(doc.id).subscribe({
        next: () => this.loadDocuments(),
        error: (err) => alert(err.error?.message || 'Error al eliminar el documento')
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
