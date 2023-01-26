import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService, SnackbarService } from '@shared';
import { Game, IGame } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class GameFactoryService {

  private readonly translateService: TranslateService;
  private readonly snackbarService: SnackbarService;
  private readonly localStorageService: LocalStorageService;

  //#region  Constructor and C°
  constructor(translateService: TranslateService, snackbarService: SnackbarService, localStorageService: LocalStorageService) {
    this.translateService = translateService;
    this.snackbarService = snackbarService;
    this.localStorageService = localStorageService;
   }
  //#endregion

  //#region  Public factory methods
  public Game(): IGame {
    return new Game(this.translateService, this.snackbarService, this.localStorageService);
  }
  //#endregion
}
