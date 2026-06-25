import { inject, Service } from '@angular/core';
import { UiEventsService } from './ui-events.service';
import { EErrorCode, IError } from 'shared-lib';
import { SnackbarParams } from './snackbar.params';

@Service()
export class ErrorHandlerService {
  //#region Private Fields ----------------------------------------------------
  private readonly uiEventsSvc: UiEventsService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.uiEventsSvc = inject(UiEventsService);
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public processError(error: IError): boolean {
    const code = error.code;
    let canContinue =
      code != EErrorCode.TeamAlreadyExists && code != EErrorCode.TeamNotFound && code != EErrorCode.ParticipantNotFound;

    const params = SnackbarParams.Error(`Enum.EErrorCode.Message.${EErrorCode[code]}`);
    this.uiEventsSvc.snackbar.set(params);

    return canContinue;
  }
}
