import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject, concat } from 'rxjs';
import { delay, map, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    let newBooking: Booking;

    return this.authService.userId.pipe(take(1), switchMap(userId => {
      newBooking = new Booking(
        Math.random().toString(),
        placeId,
        `${userId}`,
        placeTitle,
        placeImage,
        firstName,
        lastName,
        guestNumber,
        dateFrom,
        dateTo
      );

      return this.authService.token.pipe(take(1), switchMap(token => {
        return this.http.post<{ id: string }>(`${environment.requestUrl}/bookings`, {...newBooking, id: null}, {headers: {Authorization: `Bearer ${token}`}});
      }));
    }), switchMap(resData => {
      generatedId = resData.id;
      return this.bookings;
    }),
    take(1),
    tap(bookings => {
      newBooking.id = generatedId;
      this._bookings.next(bookings.concat(newBooking))
    }))
  }

  cancelBooking(bookingId: string) {
    return this.authService.token.pipe(take(1), switchMap(token => {
      return this.http.delete(`${environment.requestUrl}/bookings/${bookingId}`, {headers: {Authorization: `Bearer ${token}`}}).pipe(switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          this._bookings.next(bookings.filter(b => b.id !== bookingId));
        })
      )
    }));
  }

  fetchBookings() {
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('Could not find userId.');
      }

      return this.authService.token.pipe(take(1), switchMap(token => {
        return this.http.get<{ [key: string]: Booking }>(`${environment.requestUrl}/bookings?userId=${userId}`, {headers: {Authorization: `Bearer ${token}`}})
      }));
    }), map(bookingData => {
        const bookings = [];
        for (const key in bookingData) {
          if (bookingData.hasOwnProperty(key)) {
            bookings.push(new Booking(
              bookingData[key].id,
              bookingData[key].placeId,
              bookingData[key].userId,
              bookingData[key].placeTitle,
              bookingData[key].placeImage,
              bookingData[key].firstName,
              bookingData[key].lastName,
              bookingData[key].guestNumber,
              new Date(`${bookingData[key].bookedFrom}`),
              new Date(`${bookingData[key].bookedTo}`),
            ))
          }
        }
        return bookings;
      }), tap(bookings => {
        this._bookings.next(bookings);
      })
    );
  }
}
