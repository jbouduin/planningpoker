import { Injectable } from '@angular/core';
import { SnackbarService } from '@app/@shared';
import { TranslateService } from '@ngx-translate/core';
import { EErrorCode, IErrorMessage, ServerMessage } from '@shared-lib';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  //#region private properties ------------------------------------------------
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(snackbarService: SnackbarService, translateService: TranslateService) {
    this.snackbarService = snackbarService;
    this.translateService = translateService;
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public handleErrorMessage(message: ServerMessage): boolean {
    const code = (<IErrorMessage>message).data.code;
    this.snackbarService.showError(
      this.translateService.instant(`ErrorCode.${EErrorCode[code]}`)
    );

    const result =
      code === EErrorCode.TeamAlreadyExists ||
      code === EErrorCode.TeamDoesNotExist ||
      code === EErrorCode.ParticipantNotFound;
    return result;
  }
  //#endregion
}
