import { Coordinates } from './../../../places/location.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation } from '../../../places/location.model';
import { of } from 'rxjs';
import { Geolocation, GeolocationPlugin} from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>()
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [
        { text: 'Auto-Locate', handler: () => { this.locateUser() }},
        { text: 'Pick on Map', handler: () => { this.openMap() }},
        { text: 'Cancel', role: 'cancel'}
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    })
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showAlertMessage();
      return;
    }
    Geolocation.getCurrentPosition({
      timeout: 3000,
      maximumAge: 1000
    })
    .then(position => {
      console.log(position)
      const coordinates: Coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      this.createPlace(coordinates.lat, coordinates.lng);
      this.isLoading = false;
    })
    .catch(error => {
      this.isLoading = false;
      this.showAlertMessage();
      console.log(error)
    });
  }

  private showAlertMessage() {
    this.alertCtrl.create({
      header: 'Could not fetch location',
      message: 'Please use the map to pick a location!',
      buttons: [{text: 'Okay', role: 'cancel'}]
    }).then(alertEl => {
      alertEl.present()
    });
  }

  private openMap() {
    this.modalCtrl.create({component: MapModalComponent}).then(ModalEl => {
      ModalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        }
        this.createPlace(coordinates.lat, coordinates.lng);
      })
      ModalEl.present();
    });
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      lat              : lat,
      lng              : lng,
      address          : "",
      staticMapImageUrl: ""
    };
    this.isLoading = true;
    this.getAddress(lat, lng).pipe(
      switchMap(address => {
        pickedLocation.address = address;
        return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
      })
    ).subscribe(staticMapImageUrl => {
      pickedLocation.staticMapImageUrl = staticMapImageUrl;
      this.selectedLocationImage = staticMapImageUrl;
      this.isLoading = false;
      this.locationPick.emit(pickedLocation);
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`)
    .pipe(map(geoData => {
      if (!geoData || !geoData.results || geoData.results.length === 0) {
        return null;
      }
      return geoData.results[0].formatted_address;
    }))
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap&key=${environment.googleMapsAPIKey}&markers=color:red%7Clabel:P%7C${lat},${lng}`
  }

}
