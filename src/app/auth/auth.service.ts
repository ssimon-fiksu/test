import { Injectable } from '@angular/core';
import { RoleProvider } from './role-provider';
import { TokenProvider } from './token-provider';

@Injectable()
export class AuthService {

  token;
  constructor(
    private rolesProvider: RoleProvider,
    private tokenProvider: TokenProvider) {
  }

  public get userRoles() {
    return this.rolesProvider.roles;
  }
  
  public get getAuthorizationToken(): string {
    return this.tokenProvider.token;
  }
}
