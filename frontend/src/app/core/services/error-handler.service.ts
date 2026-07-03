import { inject, Service } from '@angular/core';
import { UiEventsService } from './ui-events.service';
import { EErrorCode, ErrorDto } from 'shared-lib';
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
  public processError(error: ErrorDto): boolean {
    const code = error.code;
    let canContinue =
      code != EErrorCode.TeamAlreadyExists && code != EErrorCode.TeamNotFound && code != EErrorCode.ParticipantNotFound;

    const params = SnackbarParams.error(`Enum.EErrorCode.${EErrorCode[code]}`);
    this.uiEventsSvc.snackbar.set(params);

    return canContinue;
  }
}
