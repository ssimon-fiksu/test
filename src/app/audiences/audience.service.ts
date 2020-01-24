import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiAnswer } from '../api-answer'

import { HttpErrorHandler, HandleError } from '../http-error-handler.service';
import { AudienceForm } from './newedit-modal/audienceForm';

@Injectable({
  providedIn: 'root'
})

export class AudienceService {

  apiURL = `${environment.apiUrl}`;
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('AudiencesService')
  }

  getProductAudiences(appRef: string, adverRef: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/audiences/${appRef}/${adverRef}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getProductAudiences'))
      );
  }

  getLookalikeSizes(): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/lookalike_sizes`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getLookalikeSizes'))
      );
  }

  getAudienceLookalike(appRef: string, audId: string) {
    return this.http.get<ApiAnswer>(`${this.apiURL}/audiences/lookalikes/${appRef}/${audId}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getAudienceLookalike'))
      );
  }

  /** POST: create a new audience */
  createAudience (audience: AudienceForm): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.apiURL}/external_audience`, audience)
      .pipe(
        catchError(this.handleError<ApiAnswer>('addAudience'))
      );
  }

  /** PUT: update the audience on the server. Returns the updated audience upon success. */
  updateAudience (audience: AudienceForm): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiURL}/external/update/${audience.id}`, audience)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateAudience'))
      );
  }

  updateSyndication(data): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiURL}/audiences/syndication/update`, data)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateAudience'))
      );
  }

  deleteAudience(data) {
    let httpParams = new HttpParams();
    Object.keys(data).forEach(function (key) {
         httpParams = httpParams.append(key, data[key]);
    });
    return this.http.delete(`${this.apiURL}/audiences/delete_audience`, {params: httpParams})
      .pipe(
        catchError(this.handleError<ApiAnswer>('deleteAudience'))
      );
  }

  uploadAudience(data) {
    const formData = new FormData();
    for ( var key in data ) {
      formData.append(key, data[key]);
    }
    return this.http.post<ApiAnswer>(`${this.apiURL}/external/upload`, formData)
      .pipe(
        catchError(this.handleError<ApiAnswer>('uploadAudience'))
      );
  }
}
