import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiAnswer } from '../api-answer'
import { environment } from '../../environments/environment';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

import { IO } from './order';

@Injectable()
export class IOService {
  apiUrl = `${environment.apiUrl}/insertion_orders`;
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('IOService')
  }

  getOrders (clientRef: string): Observable<ApiAnswer> {
    // const options = active ? { params: new HttpParams().set('active', active) } : {};
    return this.http.get<ApiAnswer>(`${this.apiUrl}/${clientRef}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getOrders'))
      );
  }

  getOrder (id: string): Observable<ApiAnswer> {
    // const options = active ? { params: new HttpParams().set('active', active) } : {};
    return this.http.get<ApiAnswer>(`${this.apiUrl}/view/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getOrder'))
      );
  }

  updateOrder (adv): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiUrl}/update/${adv.public_identifier}`, adv)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateOrder'))
      );
  }

  deleteOrder(id: string) {
    return this.http.delete(`${this.apiUrl}/delete_order/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('deleteOrder'))
      );
  }

  downloadOrder(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob'});
  }

  createOrder(data) {
    const formData = new FormData();
    for ( var key in data ) {
      formData.append(key, data[key]);
    }
    return this.http.post<ApiAnswer>(`${this.apiUrl}/create`, formData)
      .pipe(
        catchError(this.handleError<ApiAnswer>('uploadAudience'))
      );
  }
}
