import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiAnswer } from '../api-answer'
import { environment } from '../../environments/environment';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

import { BehaviorSubject } from 'rxjs';
import { Advertiser } from './advertiser';

@Injectable()
export class AdvertiserService {
  apiUrl = `${environment.apiUrl}/advertisers`;
  private advSelected = new BehaviorSubject<Advertiser>(null);
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('AdvertiserService')
  }

  public get getSelectedAdvertiser(): Observable<Advertiser> {
    return this.advSelected.asObservable();
  }

  updateSelectedAdvertiser(adv: Advertiser) {
    if(!this.advSelected.value || this.advSelected.value.public_identifier != adv.public_identifier) {
      this.advSelected.next(adv);
      localStorage.setItem('adv_pub_id', adv.public_identifier);
    }
  }

  removeSelectedAdvertiser() {
    this.advSelected.next(null);
    localStorage.removeItem('adv_pub_id');
  }

  getAdvertisers (clientRef: string): Observable<ApiAnswer> {
    // const options = active ? { params: new HttpParams().set('active', active) } : {};
    return this.http.get<ApiAnswer>(`${this.apiUrl}/${clientRef}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getAdvertisers'))
      );
  }

  getAdvertiser (id: string): Observable<ApiAnswer> {
    // const options = active ? { params: new HttpParams().set('active', active) } : {};
    return this.http.get<ApiAnswer>(`${this.apiUrl}/view/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getAdvertiser'))
      );
  }

  createAdvertiser (adv: Advertiser): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.apiUrl}/create`, adv)
      .pipe(
        catchError(this.handleError<ApiAnswer>('createAdvertiser'))
      );
  }

  updateAdvertiser (adv: Advertiser): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiUrl}/update/${adv.public_identifier}`, adv)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateAdvertiser'))
      );
  }
}
