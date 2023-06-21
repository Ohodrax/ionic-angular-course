import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { delay, map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>(
    [
      new Place(
        'p1',
        'Manhattan Mansion',
        'In the heart of New York City.',
        'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg',
        149.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      ),
      new Place(
        'p2',
        'L\'Amour Toujours',
        'A romantic place in Paris.',
        'https://media-cdn.tripadvisor.com/media/photo-s/16/0b/96/09/hotel-amour.jpg',
        189.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      ),
      new Place(
        'p3',
        'The Foggy Palace',
        'Not your average city trip!',
        'https://media.zenfs.com/en/conde_nast_traveler_225/6ba3ac9a3704cfb1d3dd59c53c66227c',
        99.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      ),
    ]
  );

  get places(){
    return this._places.asObservable();
  }

  constructor(private authService: AuthService) { }

  getPlace(id: string){
    return this.places.pipe(
      take(1),
      map(places => {
        return { ...places.find(p => p.id === id ) };
      })
    );
  }

  addPlace(
    title: string,
    descrition: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      descrition,
      'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.places.pipe(take(1), delay(1000), tap(places => {
        this._places.next(places.concat(newPlace));
    }));
  }

  updatePlace(
    placeId: string,
    title: string,
    descrition: string
  ) {
      return this.places.pipe(take(1), delay(1000), tap(places => {
        const updatedplaceIndex = places.findIndex(pl => pl.id === placeId);

        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedplaceIndex];

        updatedPlaces[updatedplaceIndex] = new Place(
          oldPlace.id,
          title,
          descrition,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.dateFrom,
          oldPlace.dateTo
        );

        this._places.next(updatedPlaces);
      }
    ));
  }
}
