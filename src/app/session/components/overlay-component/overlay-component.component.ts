import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ESessionStatus, SessionService } from '@shared/services';

@Component({
  selector: 'session-overlay-component',
  templateUrl: './overlay-component.component.html',
  styleUrls: ['./overlay-component.component.scss']
})
export class OverlayComponentComponent {
  //#region private properties ------------------------------------------------
  private readonly sessionService: SessionService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get connectionIcon(): string {
    switch (this.sessionService.status) {
      case ESessionStatus.Active:
      case ESessionStatus.Initiating:
      case ESessionStatus.Stopping:
        return 'cloud';
      case ESessionStatus.Connecting:
      case ESessionStatus.Resuming:
      case ESessionStatus.Reconnecting:
        return 'cloud_queue';
      case ESessionStatus.ReconnectPending:
      case ESessionStatus.Suspended:
      case ESessionStatus.Inactive:
        return 'cloud_off';
    }
  }

  public get showOverlay(): boolean {
    return this.sessionService.status != ESessionStatus.Active;
  }

  public get reconnectingTextLine(): string {
    if (this.sessionService.resumeIn > 1) {
      return this.translateService.instant(
        'Overlay.Component.Text.Reconnect_in_$seconds_seconds',
        { seconds: this.sessionService.resumeIn });

    } else {
      return this.translateService.instant('Overlay.Component.Text.Reconnect_in_1_second');
    }
  }

  public get reconnectNowButton(): string {
    return this.translateService.instant('Overlay.Component.Button.Reconnect_now.Label');
  }

  public get giveUpReconnectingButton(): string {
    return this.translateService.instant('Overlay.Component.Button.Give_up_reconnecting.Label');
  }

  public get showCountdown(): boolean {
    return this.sessionService.status === ESessionStatus.ReconnectPending;
  }

  public get showBreak(): boolean {
    return this.sessionService.status === ESessionStatus.Suspended;
  }

  public get havingABreakTextLine(): string {
    return this.translateService.instant('Overlay.Component.Text.Enjoy_your_break');
  }

  public get rejoinNowButton(): string {
    return this.translateService.instant('Overlay.Component.Button.Rejoin_now.Label');
  }

  public get notRejoining(): string {
    return this.translateService.instant('Overlay.Component.Button.Not_rejoining_label');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionService: SessionService, translateService: TranslateService) {
    this.sessionService = sessionService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public reconnectNowButtonClick(): void {
    this.sessionService.rejoin();
  }

  public giveUpReconnectingButtonClick(): void {
    this.sessionService.stopReconnecting();
  }

  public doNotRejoinButtonClick(): void {
    this.sessionService.quitSession();
  }
  //#endregion
}
