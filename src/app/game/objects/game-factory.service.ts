import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SnackbarService } from '@shared';

import { IGame } from './game.interface';
import { Game } from './game';

@Injectable({
  providedIn: 'root'
})
export class GameFactoryService {

  // <editor-fold desc='Constructor and C°'>
  constructor(
    private translateService: TranslateService,
    private snackbarService: SnackbarService) { }
  // </editor-fold>

  // <editor-fold desc='Public factory methods'>
  public Game(): IGame {
    return new Game(this.translateService, this.snackbarService);
  }
  // </editor-fold>
}
