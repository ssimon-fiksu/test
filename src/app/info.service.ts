import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Account } from './accounts/account';
import { ApiAnswer } from './api-answer'

import { HttpErrorHandler, HandleError } from './http-error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  apiURL = `${environment.apiUrl}`;
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('AccountsService')
  }

  private checkForArray(data) {
    if(!data || !Array.isArray(data)) data = [];
    return data;
  }

  getCategories(showRTB?): Observable<ApiAnswer> {
    const options = {  };
    if(showRTB) {
      options['params'] = new HttpParams().set('show_rtb', 'true');
    }
    return this.http.get<ApiAnswer>(`${this.apiURL}/categories`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getCategories'))
      );
  }

  getExchanges(): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/exchanges`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getExchanges'))
      );
  }

  getCountries(): Observable<any[]> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/countries`)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getCountries'))
      );
  }

  getDMA(codes: string[]): Observable<any[]> {
    const options = { params: new HttpParams().set('countries', codes.toString()) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/dmas`, options)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getDMA'))
      );
  }

  getPostalCodes(codes: string[], search: string): Observable<any[]> {
    const options = { params: new HttpParams().set('countries', codes.toString()).set("search", search) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/postal-codes`, options)
      .pipe(
        map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getPostalCodes'))
      );
  }

  getPostalCodesById(ids: string[]): Observable<any[]> {
    const options = { params: new HttpParams().set('ids', ids.toString()) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/postal-codes`, options)
      .pipe(
        map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getPostalCodesById'))
      );
  }

  getCities(codes: string[], search: string): Observable<any[]> {
    const options = { params: new HttpParams().set('countries', codes.toString()).set("search", search) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/cities`, options)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getCities'))
      );
  }

  getCitiesById(ids: string[]): Observable<any[]> {
    const options = { params: new HttpParams().set('ids', ids.toString()) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/cities`, options)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getCities'))
      );
  }

  getRegions(codes: string[]): Observable<any[]> {
    const options = { params: new HttpParams().set('countries', codes.toString()) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/regions`, options)
      .pipe(
        map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getRegions'))
      );
  }

  getGenders(): Observable<any[]> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/genders`)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getGenders'))
      );
  }

  getBidTypes(): Observable<any[]> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/bid-types`)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getBidTypes'))
      );
  }

  getGoals(): Observable<any[]> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/optimization-goals`)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getGoals'))
      );
  }

  getDeviceTypes(): Observable<any[]> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/device-types`)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getDeviceTypes'))
      );
  }

  getDeviceModels(codes: string[], p_ref: string): Observable<any[]> {
    const options = { params: new HttpParams().set('device_types', codes.toString()).set('p_ref', p_ref)  };
    return this.http.get<ApiAnswer>(`${this.apiURL}/device-models`, options)
      .pipe(
        map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getDeviceModels'))
      );
  }

  getConnectionTypes(): Observable<any[]> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/connection-types`)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getConnectionTypes'))
      );
  }

  getCarriers(): Observable<any[]> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/carriers`)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getCarriers'))
      );
  }

  getOsVersions(p_ref: string): Observable<any[]> {
    const options = { params: new HttpParams().set('p_ref', p_ref) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/os-versions`, options)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getOsVersions'))
      );
  }

  getExchangesByProduct(p_ref: string): Observable<any[]> {
    const options = { params: new HttpParams().set('p_ref', p_ref) };
    return this.http.get<ApiAnswer>(`${this.apiURL}/exchanges`, options)
      .pipe(
         map(resp => {
          return this.checkForArray(resp.data);
        }),
        catchError(this.handleError<ApiAnswer>('getExchangesByProduct'))
      );
  }

  getPubLists(p_ref: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiURL}/publisher-lists/${p_ref}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getPubLists'))
      );
  }
}
