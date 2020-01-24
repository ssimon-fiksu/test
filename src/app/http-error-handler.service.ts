import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

import { Observable, of } from 'rxjs';
import { MessagesComponent } from './messages/messages.component'
import { ApiAnswer, ApiError } from './api-answer';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <ApiAnswer> (operation?: string, result?: ApiAnswer) => (error: HttpErrorResponse) => Observable<ApiAnswer>;

/** Handles HttpClient errors */
@Injectable()
export class HttpErrorHandler {
  constructor(private snackBar: MatSnackBar) { }

  createHandleError = (serviceName = '') => <ApiAnswer>
    (operation = 'operation', result = {} as ApiAnswer) => this.handleError(serviceName, operation, result);

  handleError<ApiAnswer> (serviceName = '', operation = 'operation', result = {} as ApiAnswer) {

    return (error: HttpErrorResponse): Observable<ApiAnswer> => {
      console.error(error); // log to console instead
      let messages = [];
      if(!error.error || !error.error.errors) {
        this.openSnackBar(["The application has encountered an internal server error."]);
        return of( result );
      }
      if(error.status == 401) { //UNAUTHORIZED_ERROR
        for (var i = 0; i < error.error.errors.length; i++) {
          messages.push(error.error.errors[i].message);
        }
      } if(error.status == 400) { //BAD_REQUEST_ERROR
        console.log(error.error.errors)
        for (var i = 0; i < error.error.errors.length; i++) {
          var adInf = error.error.errors[i].additionalInfo;
          if(!(adInf instanceof Array)) {
            for (var err in adInf) {
              for (var j = 0; j < adInf[err].length; j++) {
                messages.push(adInf[err][j])
              };
            }
          } else {
            messages.push(error.error.errors[i].message)
          }
        }
        if(messages.length == 0) {
          messages.push("Validation error");
        }
      } else if(error.status == 404) {
        messages = ["Unknown route"];
      } else {
        messages = ["The application has encountered an internal server error."];
      }
      this.openSnackBar(messages);
      return of( result );
    };

  }

  parseErrors(errors: ApiError[]) {
    let messages = [];
    for (var i = errors.length - 1; i >= 0; i--) {
      messages.push(errors[i].message);
    }
    return messages;
  }

  openSnackBar(messages) {
    this.snackBar.openFromComponent(MessagesComponent, {
      data: messages
    });
  }
}
