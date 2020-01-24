import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiAnswer } from '../api-answer'
import {BehaviorSubject} from 'rxjs';

import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

import { Client } from './client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  apiURL = `${environment.apiUrl}/clients`;
  private clientSelected = new BehaviorSubject<Client>(null);
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('ClientService')
  }

  public get getSelectedClient(): Observable<Client> {
    return this.clientSelected.asObservable();
  }

  updateSelectedClient(client: Client) {
    if(!this.clientSelected.value || this.clientSelected.value.client_api_ref != client.client_api_ref) {
      this.clientSelected.next(client);
      localStorage.setItem('client_ref', client.client_api_ref);
    }
  }

  getClients(show_info: boolean): Observable<ApiAnswer> {
    const options = show_info ? { params: new HttpParams().set('show_info', 'true') } : {};
    return this.http.get<ApiAnswer>(`${this.apiURL}`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getClients'))
      );
  }

  updateFunds (deltaFunds: any, id: string): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.apiURL}/update_funds/${id}`, deltaFunds)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateFunds'))
      );
  }
}