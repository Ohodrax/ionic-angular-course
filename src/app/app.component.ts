import { AuthService } from './auth/auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Plugin, Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private plataform: Platform,
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout(){
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }
}
