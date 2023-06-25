import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { delay, map, take, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places(){
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

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
            resData[key].userId
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
        placeData.userId
      )
    }))
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
  ) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.http
      .post<{ id: string }>(
        'http://localhost:3001/offered-places',
        {
          ...newPlace,
          id: null
        }
      )
      .pipe(
        switchMap(resData => {
          generatedId = resData.id;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
    // const newPlace = new Place(
    //   Math.random().toString(),
    //   title,
    //   descrition,
    //   'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg',
    //   price,
    //   dateFrom,
    //   dateTo,
    //   this.authService.userId
    // );
    // return this.places.pipe(take(1), delay(1000), tap(places => {
    //     this._places.next(places.concat(newPlace));
    // }));
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
          oldPlace.userId
        );
        return this.http.put(`http://localhost:3001/offered-places/${placeId}`, {...updatedPlaces[updatedplaceIndex], id: null });
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
