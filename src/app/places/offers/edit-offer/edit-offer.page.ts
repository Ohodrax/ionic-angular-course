import { PlacesService } from './../../places.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Place } from '../../place.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  form: FormGroup;
  placeId: string;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl: NavController,
    private router: Router,
    private loaderCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {

    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.placeId = `${paramMap.get('placeId')}`;
      this.isLoading = true;

      this.placeSub = this.placesService.getPlace(this.placeId).subscribe(place => {
        this.place = place;

        this.form = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required]
          })
        });

        this.isLoading = false
      }, error => {
        this.alertCtrl.create(
          {
            header: 'An error occurred!',
            message: 'Place could not be fetched. Please try again later.',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['/places/tabs/offers'])
                }
              }
            ]
          }
        ).then(alertEl => {
          alertEl.present();
        })
      });
    });

  }

  ngOnDestroy(): void {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

  onUpdateOffer(){
    if (!this.form.valid) {
      return;
    }
    this.loaderCtrl.create({
      message: 'Updating place...'
    }).then(loadingEl => {
      loadingEl.present();

      this.placesService.updatePlace(
        this.placeId,
        this.form.value.title,
        this.form.value.description
      ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/places/tabs/offers']);
      })
    });
  }
}
