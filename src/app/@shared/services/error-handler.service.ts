import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { IErrorMessage, ServerMessage } from '@shared-lib';

import { enumMarker } from '@core/marker';
import { SnackbarService } from '@shared';

// required because of ngx-translate-extract
import { EErrorCode } from '../../../../projects/shared-lib/lib/messages/error-code.enum';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  //#region private properties ------------------------------------------------
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  private readonly errorCodePrefix: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(snackbarService: SnackbarService, translateService: TranslateService) {
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.errorCodePrefix = enumMarker("ErrorCode.Message.", EErrorCode);
  }
  //#endregion

  //#region public methods ----------------------------------------------------

  public handleErrorMessage(message: ServerMessage): boolean {
    const code = (<IErrorMessage>message).data.code;
    this.snackbarService.showError(
      this.translateService.instant(`${this.errorCodePrefix}${EErrorCode[code]}`)
    );

    const result =
      code === EErrorCode.TeamAlreadyExists ||
      code === EErrorCode.TeamDoesNotExist ||
      code === EErrorCode.ParticipantNotFound;
    return result;
  }
  //#endregion
}
