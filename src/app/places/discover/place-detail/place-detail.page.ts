import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { BookingService } from  '../../../bookings/booking.service'
import { AuthService } from '../../..//auth/auth.service';
import { PlaceLocation } from '../../location.model';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      const id = `${paramMap.get('placeId')}`;
      this.isLoading = true;
      let fetcheduserId: string;

      this.authService.userId.pipe(take(1), switchMap(userId => {
        if (!userId) {
          throw new Error('Could not find userId.');
        }

        fetcheduserId = userId;

        return this.placesService.getPlace(id);
      })).subscribe(place => {
        this.place = place;
        this.isBookable = place.userId !== fetcheduserId;
        this.isLoading = false;
      }, error => {
        this.alertCtrl.create(
          {
            header: 'An error occurred!',
            message: 'Could not load place.',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['/places/tabs/discover'])
                }
              }
            ]
          }
        ).then(alertEl => {
          alertEl.present();
        })
      });
    })
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

  onBookPlace() {
    // this.navCtrl.navigateBack('/places/tabs/discover');
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },{
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },{
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }
  openBookingModal(mode: 'select' | 'random') {
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    })
    .then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    })
    .then(resultData => {
      console.log(resultData.data, resultData.role);

      if (resultData.role === 'confirm') {
        this.loadingCtrl.create({message: 'Booking place...'}).then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingService.addBooking(
            `${this.place.id}`,
            `${this.place.title}`,
            `${this.place.imageUrl}`,
            data.firstName,
            data.lastName,
            data.guestsNumber,
            data.dateFrom,
            data.dateTo
          ).subscribe(() => {
            loadingEl.dismiss();
          });
        })
      }
    })
  }
  onShowFullMap(){
    this.modalCtrl.create({component: MapModalComponent, componentProps: {
      center: {lat: this.place.location?.lat, lng: this.place.location?.lng},
      selectable: false,
      closeButtonText: 'Close',
      title: this.place.location?.address,
    }}).then(modalEl => {
      modalEl.present();
    })
  }
}
