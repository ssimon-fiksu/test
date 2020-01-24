import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiAnswer } from './api-answer'

import { HttpErrorHandler, HandleError } from './http-error-handler.service';
import { Event } from './products/events-modal/events-modal.component';

export class PartnerForm {
  name: string;
  client_ref: string;
  id: number
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  apiURL = `${environment.apiUrl}/tracking`;
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('TrackingService')
  }

  private checkForArray(data) {
    if(!data || !Array.isArray(data)) data = [];
    return data;
  }

  getPartners(client_ref: string): Observable<any[]> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/partners/${client_ref}`)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getPartners'))
      );
  }

  createPartner(partner: PartnerForm): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.apiURL}/partners/create`, partner)
      .pipe(
        catchError(this.handleError<ApiAnswer>('createPartner'))
      );
  }

  updatePartner(partner: PartnerForm): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiURL}/partners/update/${partner.id}`, partner)
      .pipe(
        catchError(this.handleError<ApiAnswer>('createPartner'))
      );
  }

  getEvents(pRef: string): Observable<ApiAnswer> {
    const options = { params: new HttpParams().set('p_ref', pRef) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/event-configuration`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getEvents'))
      );
  }

  updateEvents(pRef: string, events: Event[]): Observable<ApiAnswer> {
    let data = {
      "p_ref": pRef,
      "params": events
    }
    return this.http.put<ApiAnswer>(`${this.apiURL}/event-configuration/update`, data)
      .pipe(
        catchError(this.handleError<ApiAnswer>('createPartner'))
      );
  }

  getEventPostBack(pRef: string, eventId: string) {
    const options = { params: new HttpParams().set('p_ref', pRef).set('event_id', eventId) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/postback`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getEventPostBack'))
      );
  }
}
