import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { TeamService } from '@app/session/services/team.service';
import { ConnectionService, EConnectionStatus } from '@shared';
import { SessionService } from '@shared/services/session.service';

@Component({
  selector: 'session-overlay-component',
  templateUrl: './overlay-component.component.html',
  styleUrls: ['./overlay-component.component.scss']
})
export class OverlayComponentComponent {
  //#region private properties ------------------------------------------------
  private readonly connectionService: ConnectionService;
  private readonly sessionService: SessionService;
  private readonly teamService: TeamService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get connectionIcon(): string {
    switch (this.connectionService.connectionStatus) {
      case EConnectionStatus.Disconnected:
      case EConnectionStatus.Countdown:
        return 'cloud_off';
      case EConnectionStatus.Connected:
        return 'cloud';
      case EConnectionStatus.Reconnecting:
      case EConnectionStatus.Connecting:
        return 'cloud_queue';
    }
  }

  public get showOverlay(): boolean {
    return this.connectionService.connectionStatus !== EConnectionStatus.Connected;
  }

  public get reconnectingTextLine(): string {
    if (this.connectionService.reconnectIn > 1) {
      return this.translateService.instant(
        'Overlay.Component.Text.Reconnect_in_$seconds_seconds',
        { seconds: this.connectionService.reconnectIn });

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
    return this.connectionService.connectionStatus === EConnectionStatus.Countdown;
  }

  public get showReconnecting(): boolean {
    return this.connectionService.connectionStatus === EConnectionStatus.Countdown;
  }

  public get showBreak(): boolean {
    return this.connectionService.connectionStatus === EConnectionStatus.Disconnected;
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
  public constructor(
    connectionService: ConnectionService,
    sessionService: SessionService,
    teamService: TeamService,
    translateService: TranslateService) {
    this.connectionService = connectionService;
    this.sessionService = sessionService;
    this.teamService = teamService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public reconnectNowButtonClick(): void {
    this.connectionService.reconnectNow();
  }

  public giveUpReconnectingButtonClick(): void {
    this.connectionService.giveUpReconnecting();
  }

  public doNotRejoinButtonClick(): void {
    this.sessionService.leave(this.teamService.teamName, this.teamService.me.uuid);
  }
  //#endregion
}
