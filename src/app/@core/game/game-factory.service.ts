import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ToastService } from '../../toast'

import { Game } from './game';
import { GameInstance } from './game-instance';

@Injectable({
  providedIn: 'root'
})
export class GameFactoryService {

  // <editor-fold desc='Constructor and C°'>
  constructor(
    private translateService: TranslateService,
    private toastService: ToastService) { }
  // </editor-fold>

  // <editor-fold desc='Public factory methods'>
  public Game(): Game {
    return new GameInstance(this.translateService, this.toastService);
  }
  // </editor-fold>
}
