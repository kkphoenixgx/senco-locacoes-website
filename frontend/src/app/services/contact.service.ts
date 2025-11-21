import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  private contactUrl = `${environment.apiUrl}/contact`;

  sendMessage(formData: ContactFormData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.contactUrl, formData);
  }
}