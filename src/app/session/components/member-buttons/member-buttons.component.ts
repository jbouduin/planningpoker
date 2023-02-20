import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { EParticipantStatus } from '@shared-lib';

import { SessionService } from '@shared/services';

@Component({
  selector: 'session-member-buttons',
  templateUrl: './member-buttons.component.html',
  styleUrls: ['./member-buttons.component.scss']
})
export class MemberButtonsComponent {

  //#region Private Properties ------------------------------------------------
  private readonly sessionService: SessionService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get canPause(): boolean {
    return this.sessionService.myStatus === EParticipantStatus.Connected;
  }

  public get leaveLabel(): string {
    return this.sessionService.scrumMaster ?
      this.translateService.instant('ScrumMasterButtons.Component.Button.EndSession.Label') :
      this.translateService.instant('MemberButtons.Component.Button.Leave.Label');
  }

  public get pauseButtonLabel(): string {
    return this.translateService.instant('MemberButtons.Component.Button.Pause.Label');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionService: SessionService, translateService: TranslateService) {
    this.sessionService = sessionService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public pause(): void{
    this.sessionService.suspendSession();
  }

  public leave(): void {
    this.sessionService.quitSession();
  }
  //#endregion
}
