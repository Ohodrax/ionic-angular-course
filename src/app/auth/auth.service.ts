import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userIsAutenticated = false;

  get userIsAutenticated() {
    return this._userIsAutenticated;
  }

  constructor() { }

  login() {
    this._userIsAutenticated = true;
  }

  logout() {
    this._userIsAutenticated = false;
  }
}
