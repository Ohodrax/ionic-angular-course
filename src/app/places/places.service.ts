import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://imgs.6sqft.com/wp-content/uploads/2014/06/21042534/Felix_Warburg_Mansion_007.jpg',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
    ),
    new Place(
      'p2',
      'L\'Amour Toujours',
      'A romantic place in Paris.',
      'https://media-cdn.tripadvisor.com/media/photo-s/16/0b/96/09/hotel-amour.jpg',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
    ),
    new Place(
      'p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://media.zenfs.com/en/conde_nast_traveler_225/6ba3ac9a3704cfb1d3dd59c53c66227c',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
    ),
  ];

  get places(){
    return [...this._places];
  }

  getPlace(id: string){
    return {...this._places.find(p => p.id === id )};
  }

  constructor() { }
}
