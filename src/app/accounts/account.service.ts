import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Account } from './account';
import { AccountForm } from './edit/account-form';
import { ApiAnswer } from '../api-answer'
import { environment } from '../../environments/environment';

import { HttpErrorHandler, HandleError } from '../http-error-handler.service';


@Injectable()
export class AccountService {
  accountsUrl = `${environment.apiUrl}/accounts`;
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('AccountsService')
  }

  /** GET accounts from the server */
  getAccounts (active): Observable<ApiAnswer> {
    const options = active ? { params: new HttpParams().set('active', active) } : {};
    return this.http.get<ApiAnswer>(this.accountsUrl, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getAccounts'))
      );
  }

  /** POST Add/Substruct funds to account */
  addFunds (deltaFunds, id): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.accountsUrl}/substract_funds/${id}`, deltaFunds)
      .pipe(
        catchError(this.handleError<ApiAnswer>('addFunds'))
      );
  }

  /** GET apps */
  getApps (): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.accountsUrl}/apps`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getApps'))
      );
  }

  getAudiences(id): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.accountsUrl}/audience_options/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getAudiences'))
      );
  }

  publisherCsv(id): Observable<Blob> {
    return this.http.get(`${this.accountsUrl}/publisher_csv/${id}`, { responseType: 'blob'});
  }

  /** GET: get account from the server by id */
  getAccount (id: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.accountsUrl}/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getAccount'))
      );
  }

  getAccInfo(id: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.accountsUrl}/info/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getAccount'))
      );
  }

  //////// Save methods //////////

  /** POST: create a new account */
  createAccount (account: AccountForm): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.accountsUrl}/create`, account)
      .pipe(
        catchError(this.handleError<ApiAnswer>('addAccount'))
      );
  }

  /** PUT: update the account on the server. Returns the updated account upon success. */
  updateAccount (account: AccountForm, id: string): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.accountsUrl}/update/${id}`, account)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateAccount'))
      );
  }

  updateAccInfo(accid: string, type: string, options): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.accountsUrl}/${type}/${accid}`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateAccInfo'))
      );
  }

  updateAudiences(id, data): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.accountsUrl}/audiences/${id}`, data)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateAudiences'))
      );
  }

  updatePubLists(id, data): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.accountsUrl}/publisher_lists/${id}`, data)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updatePubLists'))
      );
  }

  updateDateTime(id, data): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.accountsUrl}/day_time_target/${id}`, data)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateDateTime'))
      );
  }
}
