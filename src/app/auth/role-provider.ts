import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject} from 'rxjs';


@Injectable()
export class RoleProvider {

    private currentRolesSubject: BehaviorSubject<Array<string>>;
    
    constructor(private http: HttpClient) {
      this.currentRolesSubject = new BehaviorSubject<Array<string>>(JSON.parse(localStorage.getItem('roles')));
    }

    get roles(): Array<string> {
      return this.currentRolesSubject.value;
    }

    getRoles() {
      if(!this.currentRolesSubject.value || !localStorage.getItem('roles')) {
         return this.gotoServer();
      }
      return this.currentRolesSubject.asObservable();
    }

    gotoServer() {
     const promise =  this.http.get<any>(`${environment.apiUrl}/account_roles`)
       .toPromise()
       .then(data => {
            localStorage.setItem('roles', JSON.stringify(data.data));
            this.currentRolesSubject.next(data.data);
          });
       return promise;
    }
}
