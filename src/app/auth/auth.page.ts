import { Component, OnInit } from '@angular/core';
import { AuthResponseData, AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  authenticate(email: string, password: string){
    this.isLoading = true;

    this.loadingCtrl.create({keyboardClose: true, message: 'Logging in....'}).then(loadingEl => {
      loadingEl.present();

      let authObs: Observable<AuthResponseData>;

      if (this.isLogin) {
        authObs = this.authService.login(email, password);
      } else {
        authObs = this.authService.signup(email, password)
      }

      authObs.subscribe(resData => {
        console.log(resData)
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover')
      }, errRes => {
        loadingEl.dismiss();
        const code = errRes.error.error.message;

        let message;

        switch (code) {
          case "EMAIL_EXISTS":
            message = 'The email address is already in use by another account.';
          break;

          case "OPERATION_NOT_ALLOWED":
            message = 'Password sign-in is disabled for this project.';
          break;

          case "TOO_MANY_ATTEMPTS_TRY_LATER":
            message = 'We have blocked all requests from this device due to unusual activity. Try again later.';
          break;

          case "EMAIL_NOT_FOUND":
            message = 'There is no user record corresponding to this identifier. The user may have been deleted.';
          break;

          case "INVALID_PASSWORD":
            message = 'The password is invalid or the user does not have a password.';
          break;

          case "USER_DISABLED":
            message = 'The user account has been disabled by an administrator.';
          break;

          default:
            message = 'Could not sign you up, please try again.';
          break;
        }

        this.showAlert(message);
      });
    });

  }

  onSubmit(form: NgForm){
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password)

    this.authenticate(email, password);
    if (this.isLogin) {
      // Send a request to Login servers
    } else {
      // Send a request to Signup servers
    }
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Authentication failed',
      message: message,
      buttons: ['Okay']
    }).then(alertEl => {
      alertEl.present()
    })
  }

  onSwitchAuthMode(){
    this.isLogin = !this.isLogin;
  }

}
