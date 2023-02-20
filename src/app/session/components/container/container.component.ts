import { Component } from '@angular/core';
import { ESessionStatus } from '@app/@shared/services/session-status.enum';
import { SessionService } from '@app/@shared/services/session.service';

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
    return this.sessionService.status === ESessionStatus.Disconnected || this.sessionService.status === ESessionStatus.ResumePending;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }
  //#endregion
}
