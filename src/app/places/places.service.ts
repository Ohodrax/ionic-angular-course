import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, Observable, Observer, of } from 'rxjs';
import { delay, map, take, tap, switchMap, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  downloadURL: Observable<string>;
  fb: any;

  get places(){
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient, private storage: AngularFireStorage) { }

  fetchPlaces() {
    return this.http.get<{ [key: string]: Place }>('http://localhost:3001/offered-places').pipe(tap(resData => {})).pipe(map(resData => {
      const places = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          places.push(new Place(
            resData[key].id,
            resData[key].title,
            resData[key].description,
            resData[key].imageUrl,
            resData[key].price,
            new Date(`${resData[key].dateFrom}`),
            new Date(`${resData[key].dateTo}`),
            resData[key].userId,
            resData[key].location
          ))
        }
      }
        return places;
      }),
      tap(places => {
        this._places.next(places);
      })
    );
  }

  getPlace(id: string){
    return this.http.get<Place>(`http://localhost:3001/offered-places/${id}`).pipe(map(placeData => {
      return new Place(
        id,
        placeData.title,
        placeData.description,
        placeData.imageUrl,
        placeData.price,
        new Date(`${placeData.dateFrom}`),
        new Date(`${placeData.dateTo}`),
        placeData.userId,
        placeData.location
      )
    }))
  }

  uploadImage(image: File): Observable<{ imageUrl: string }> {
    return new Observable((observer: Observer<{ imageUrl: string }>) => {
      var n = Date.now();
      const filePath = `${n}`;
      const fileRef = this.storage.ref(filePath);

      const task = this.storage.upload(`${n}`, image);
      task.snapshotChanges().pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(url => {
            if (url) {
              this.fb = url;
              observer.next({ imageUrl: this.fb }); // Emit the URL
              observer.complete(); // Complete the Observable
            }
          });
        })
      ).subscribe();

      // Cleanup logic (if needed)
      return () => {
        // Unsubscribe from any ongoing operations
        // and perform necessary cleanup tasks
      };
    });
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId: string;
    let newPlace: Place;

    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if(!userId){
        throw new Error('No user ID found.');
      }

      newPlace = new Place(
        Math.random().toString(),
        title,
        description,
        imageUrl,
        price,
        dateFrom,
        dateTo,
        userId,
        location,
      );

      return this.http
      .post<{ id: string }>(
        'http://localhost:3001/offered-places',
        {
          ...newPlace,
          id: null
        }
      );
    }), switchMap(resData => {
          generatedId = resData.id;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(placeId: string, title: string, descrition: string) {

    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedplaceIndex = places.findIndex((pl) => pl.id?.toString() === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedplaceIndex];
        updatedPlaces[updatedplaceIndex] = new Place(
          oldPlace.id,
          title,
          descrition,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.dateFrom,
          oldPlace.dateTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(`http://localhost:3001/offered-places/${placeId}`, {...updatedPlaces[updatedplaceIndex], id: null });
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
