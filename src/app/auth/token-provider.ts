import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable()
export class TokenProvider {

    private currentToken: BehaviorSubject<string>;

    constructor() {
      this.currentToken = new BehaviorSubject<string>(localStorage.getItem('token'));
    }

    get token(): string {
      this.checkToken();
      return this.currentToken.value;
    }

    getToken() {
      this.checkToken();
      return this.currentToken.asObservable();
    }

    checkToken() {
      let apikey = this.getApikeyParam();
      if(this.currentToken.value != apikey ) {
        localStorage.setItem('token', apikey);
        localStorage.removeItem('roles');
        this.currentToken.next(apikey);
      }
    }

    getApikeyParam() {
      let url = new URL(window.location.href);
      return url.searchParams.get("apikey");
    }
}
