import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiAnswer } from '../api-answer'
import { environment } from '../../environments/environment';

import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

@Injectable()
export class CampaignPerformanceService {

  campaignPerformancesUrl = `${environment.apiUrl}`;
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('CampaignPerformanceService')
  }

  getCamps (accid: string, active: string): Observable<ApiAnswer> {
    const options = active ? { params: new HttpParams().set('active', active) } : {};
    return this.http.get<ApiAnswer>(`${this.campaignPerformancesUrl}/campaign_performance/${accid}`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getCamps'))
      );
  }
  
  getSiteLists(id: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.campaignPerformancesUrl}/site_lists/view/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getSiteLists'))
      );
  }
}
