import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() {
    console.log('in Gameservice constructor');
  }
}
