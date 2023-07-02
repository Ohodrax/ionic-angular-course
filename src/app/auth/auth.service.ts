import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, from, map, tap } from 'rxjs';
import { User } from './user.model';
import { Preferences } from '@capacitor/preferences';

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
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(new User(null, null, null, null));
  private activeLogoutTimer: any;

  ngOnDestroy(): void {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  get userIsAuthenticated() {
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

  get token() {
    return this._user.asObservable().pipe(map(user => {
      if (user) {
        return user.token;
      } else {
        return null;
      }
    }));
  }

  constructor(
    private http: HttpClient
  ) { }

  autoLogin(): Observable<boolean> {
    return from(Preferences.get({key: 'authData'})).pipe(map(storedData => {
      if(!storedData || !storedData.value){
        return null;
      }

      const parsedData = JSON.parse(storedData.value) as {token: string; tokenExpirationDate: string, userId: string, email: string};

      const expirationTime = new Date(parsedData.tokenExpirationDate);
      if (expirationTime <= new Date()) {
        return null;
      }

      const user = new User(parsedData.userId, parsedData.email, parsedData.token, expirationTime);

      return user as User;
    }),
    tap(user => {
      if (user) {
        this._user.next(user);
        this.autoLogout(user.tokenDuration);
      }
    }),
    map(user => {
      return !!user as boolean;
    }));
  }

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
      password: password,
      returnSecureToken: true
    }).pipe(tap(this.setuserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(new User(null, null, null, null));
    Preferences.remove({key: 'authData'});
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private setuserData(userData: AuthResponseData) {
    const expirationTime = new Date(
      new Date().getTime() + (+userData.expiresIn * 1000)
    );

    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    )

    this._user.next(user);
    this.autoLogout(user.tokenDuration);

    this.storeAuthData(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email);
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = JSON.stringify({userId: userId, token: token, tokenExpirationDate: tokenExpirationDate, email: email});

    Preferences.set({
      key: 'authData', value: data
    })
  }
}
