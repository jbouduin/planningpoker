import { Component } from '@angular/core';

import { ESessionStatus, SessionService } from '@shared/services';

@Component({
  selector: 'session-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent {

  //#region private properties ------------------------------------------------
  private readonly sessionService: SessionService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get showOverlay(): boolean {
    return this.sessionService.status === ESessionStatus.Reconnecting ||
      this.sessionService.status === ESessionStatus.ReconnectPending ||
      this.sessionService.status === ESessionStatus.Initiating ||
      this.sessionService.status === ESessionStatus.Suspended;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }
  //#endregion
}
