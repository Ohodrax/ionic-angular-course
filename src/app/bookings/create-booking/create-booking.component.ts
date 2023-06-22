import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Place } from '../../places/place.model';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Place
  @Input() selectedMode: 'select' | 'random';
  startDate: string;
  endDate: string;
  dateFrom: any

  @ViewChild('f', { static: true }) form: NgForm;


  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    const availableFrom = new Date(`${this.selectedPlace.dateFrom}`);
    const availableTo = new Date(`${this.selectedPlace.dateTo}`);

    if (this.selectedMode === 'random') {
      this.startDate = new Date(availableFrom.getTime() + Math.random() * (availableTo.getTime() - 7 * 24 * 60 * 60 * 1000 - availableFrom.getTime())).toISOString();
      this.endDate = new Date(new Date(this.startDate).getTime() + Math.random() * (new Date(this.startDate).getTime() + 6 * 24 * 60 * 60 * 1000 - new Date(this.startDate).getTime())).toISOString();
    }
  }

  onBookPlace(){
    if (!this.form.valid || !this.datesValid) {
      return;
    }
    this.modalCtrl.dismiss({ bookingData: {
      firstName: this.form.value['first-name'],
      lastName: this.form.value['last-name'],
      guestsNumber: +this.form.value['guests-number'],
      dateFrom: new Date(this.form.value['dateFrom']),
      dateTo: new Date(this.form.value['dateTo'])
    }}, 'confirm')
  }

  onCancel(){
    this.modalCtrl.dismiss(null, 'cancel');
  }

  datesValid(){
    const startDate = new Date(this.form.value['dateFrom']);
    const endDate = new Date(this.form.value['dateTo']);

    return endDate > startDate;
  }

}
