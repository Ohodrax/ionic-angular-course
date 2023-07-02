export class User {
  constructor(
    public id: string | null,
    public email: string | null,
    private _token: string | null,
    private tokenExpirationDate: Date | null
  ) {

  }

  get token() {
    if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
      return null;
    }

    return this._token;
  }

  get tokenDuration() {
    if (!this.token) {
      return 0;
    }

    return (new Date(`${this.tokenExpirationDate}`)).getTime() - new Date().getTime();
  }
}
