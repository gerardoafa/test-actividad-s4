import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { DocumentFile } from '../models/document.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:5000/api/documents';

  private documentsSubject = new BehaviorSubject<DocumentFile[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  uploadDocument(file: File): Observable<DocumentFile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DocumentFile>(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  getDocuments(): Observable<DocumentFile[]> {
    return this.http.get<DocumentFile[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getDocumentById(documentId: string): Observable<DocumentFile> {
    return this.http.get<DocumentFile>(`${this.apiUrl}/${documentId}`, { headers: this.getHeaders() });
  }

  deleteDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}`, { headers: this.getHeaders() });
  }

  loadDocuments(): void {
    this.getDocuments().subscribe({
      next: (docs) => this.documentsSubject.next(docs),
      error: (err) => console.error('Error loading documents:', err)
    });
  }
}
