import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SnackbarService } from '@shared';

import { Game } from './game';
import { GameInstance } from './game-instance';

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
  public Game(): Game {
    return new GameInstance(this.translateService, this.snackbarService);
  }
  // </editor-fold>
}
