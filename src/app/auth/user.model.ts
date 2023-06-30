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
}
