import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from '@shared';

export class Game {

  //#region Private readonly properties ---------------------------------------
  private readonly translateService: TranslateService;
  private readonly snackbarService: SnackbarService;
  //#endregion



  //#region Constructor & C° --------------------------------------------------
  public constructor(
    translateService: TranslateService,
    snackbarService: SnackbarService) {
    this.translateService = translateService;
    this.snackbarService = snackbarService;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------


  public handleDisconnect(): void {
    this.snackbarService.showError(
      this.translateService.instant('Game.Snackbar.Disconnected')
    );
    // this.gameStatus = EGameStatus.Disconnected;
  }


  public handleSocketError(_error: any): void { // eslint-disable-line
    this.snackbarService.showError(
      this.translateService.instant('Game.Snackbar.CommunicationError')
    );
  }
  //#endregion




}
