import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent  implements OnInit {

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() {}

  onPrickLocation() {
    this.modalCtrl.create({component: MapModalComponent}).then(ModalEl => {
      ModalEl.onDidDismiss().then(modalData => {
        console.log(modalData)
        console.log(modalData.data)
      })
      ModalEl.present();
    })
  }


}
