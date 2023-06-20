import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userIsAutenticated = true;
  private _userId = 'abc';

  get userIsAutenticated() {
    return this._userIsAutenticated;
  }

  get userId(){
    return this._userId;
  }

  constructor() { }

  login() {
    this._userIsAutenticated = true;
  }

  logout() {
    this._userIsAutenticated = false;
  }
}
