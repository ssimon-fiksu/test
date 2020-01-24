import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const userRoles = this.authService.userRoles;
        if (userRoles) {
            if (route.data.roles && userRoles.filter(value => route.data.roles.includes(value)).length == 0) {
                // this.router.navigate(['/']);
                return false;
            }
            // authorised so return true
            return true;
        }

        // this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}