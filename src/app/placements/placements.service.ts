import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiAnswer } from '../api-answer'
import { environment } from '../../environments/environment';

import { HttpErrorHandler, HandleError } from '../http-error-handler.service';
import { PlacementForm } from './edit/placement-form';

@Injectable({
  providedIn: 'root'
})
export class PlacementsService {

  apiURL = `${environment.apiUrl}/placements`;
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('PlacementsService')
  }

  getPlacement(id: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/view/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getPlacement'))
      );
  }

  updateStatus(id: string, status: string): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiURL}/status/${id}`, {'status': status})
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateStatus'))
      );
  }

  getProductPlacements(campPId: string, status: string, p_ref: string): Observable<ApiAnswer> {
    const options = { params: new HttpParams().set('status', status).set('p_ref', p_ref).set('campaign', campPId) };
    return this.http.get<ApiAnswer>(`${this.apiURL}`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getProductPlacements'))
      );
  }

  getDefaultCaps(): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/default-caps`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getDefaultCaps'))
      );
  }

  createPlacement (placement: PlacementForm): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.apiURL}/create`, placement)
      .pipe(
        catchError(this.handleError<ApiAnswer>('createPlacement'))
      );
  }

  updatePlacement (placement: PlacementForm): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiURL}/update/${placement.public_identifier}`, placement)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updatePlacement'))
      );
  }
}
