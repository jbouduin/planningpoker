import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SnackbarService } from '@shared';

import { IGame } from './game.interface';
import { Game } from './game';

@Injectable({
  providedIn: 'root'
})
export class GameFactoryService {

  //#region  Constructor and C°
  constructor(
    private translateService: TranslateService,
    private snackbarService: SnackbarService) { }
  //#endregion

  //#region  Public factory methods
  public Game(): IGame {
    return new Game(this.translateService, this.snackbarService);
  }
  //#endregion
}
