import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map, tap } from 'rxjs';
import { User } from './user.model';

export interface AuthResponseData {
  kind        : string;
  idToken     : string;
  email       : string;
  refreshToken: string;
  expiresIn   : string;
  localId     : string;
  registered? : boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user = new BehaviorSubject<User>(new User(null, null, null, null));

  get userIsAutenticated() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return !!user.token;
      } else {
        return false;
      }
    }));
  }

  get userId(){
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    }));
  }

  constructor(
    private http: HttpClient
  ) { }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseApiKey}`, {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(tap(this.setuserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`, {
      email: email,
      password: password
    }).pipe(tap(this.setuserData.bind(this)));
  }

  logout() {
    this._user.next(new User(null, null, null, null));
  }

  private setuserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + (+userData.expiresIn * 1000)
    );

    this._user.next(new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    ));
  }
}
