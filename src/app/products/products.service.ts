import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiAnswer } from '../api-answer'
import { environment } from '../../environments/environment';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';
import { BehaviorSubject } from 'rxjs';

import { ProductForm } from './productForm';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  apiUrl = `${environment.apiUrl}/applications`;
  private productSelected = new BehaviorSubject<Product>(null);
  private handleError: HandleError;  // URL to web api

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) { 
    this.handleError = httpErrorHandler.createHandleError('ProductsService')
  }

  public get getSelectedProduct(): Observable<Product> {
    return this.productSelected.asObservable();
  }

  updateSelectedProduct(product: Product) {
    if(!this.productSelected.value || this.productSelected.value && this.productSelected.value.app_ref != product.app_ref) {
      this.productSelected.next(product);
      localStorage.setItem('app_ref', product.app_ref);
    }
  }

  removeSelectedProduct() {
    this.productSelected.next(null);
    localStorage.removeItem('app_ref');
  }


  getProducts (advRef: string): Observable<ApiAnswer> {
    const options = advRef ? { params: new HttpParams().set('advertiser', advRef) } : {};
    return this.http.get<ApiAnswer>(`${this.apiUrl}`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getProducts'))
      );
  }

  getCategories(): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiUrl}/categories`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getProducts'))
      );
  }

  getProduct (id: string): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiUrl}/view/${id}`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getProduct'))
      );
  }

  createProduct (product: ProductForm): Observable<ApiAnswer> {
    return this.http.post<ApiAnswer>(`${this.apiUrl}/create`, product)
      .pipe(
        catchError(this.handleError<ApiAnswer>('createProduct'))
      );
  }

  lookup(storeUrl: string): Observable<ApiAnswer> {
    const options = { params: new HttpParams().set('store_url', encodeURI(storeUrl)) };
    return this.http.get<ApiAnswer>(`${this.apiUrl}/lookup`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('lookup'))
      );
  }

  getUrls(adv: string, product: string): Observable<ApiAnswer> {
    const options = { params: new HttpParams().set('advertiser', adv).set('app', product) };
    return this.http.get<ApiAnswer>(`${this.apiUrl}/urls`, options)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getUrls'))
      );
  }

  updateUrls(data): Observable<ApiAnswer> {
    return this.http.put<ApiAnswer>(`${this.apiUrl}/urls`, data)
      .pipe(
        catchError(this.handleError<ApiAnswer>('updateUrls'))
      );
  }

  getMacroses(): Observable<ApiAnswer> {
    return this.http.get<ApiAnswer>(`${this.apiUrl}/macros`)
      .pipe(
        catchError(this.handleError<ApiAnswer>('getMacroses'))
      );
  }
}
