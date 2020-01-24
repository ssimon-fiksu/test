import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiAnswer } from '../api-answer'
import { environment } from '../../environments/environment';

import { HttpErrorHandler, HandleError } from '../http-error-handler.service';
import { CampaignForm } from './edit-campaign-modal/campaignForm';

@Injectable({
  providedIn: 'root'
})
export class CampaignsService {

  apiURL = `${environment.apiUrl}/campaigns`;
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('CampaignsService')
  }

  getInfo(id: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/info/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getCampInfo'))
      );
  }

  updateStatus(id: string, status: boolean): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiURL}/status/${id}`, {'enabled': +status})
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateStatus'))
      );
  }

  getCampaign(id: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/view/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getCampaign'))
      );
  }

  toggleStatus(id: string, status: string): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiURL}/toggle_status/${id}`, {'status': status})
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateStatus'))
      );
  }

  getProductCampaigns(p_ref: string, status: string): Observable<ApiAnswer> {
    const options = { params: new HttpParams().set('status', status).set('p_ref', p_ref) };
    return this.http.get<ApiAnswer>(`${this.apiURL}`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getProductCampaigns'))
      );
  }

  getDefaultCaps(): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/default-caps`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getDefaultCaps'))
      );
  }

  createCampaign (campaign: CampaignForm): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.apiURL}/create`, campaign)
      .pipe(
        catchError(this.handleError<ApiAnswer>('createCampaign'))
      );
  }

  updateCampaign (campaign: CampaignForm): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiURL}/update/${campaign.public_identifier}`, campaign)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateCampaign'))
      );
  }
}
