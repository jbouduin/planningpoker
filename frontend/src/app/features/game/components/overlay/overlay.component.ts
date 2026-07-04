import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ESessionState, ESocketState, extract, SessionService, SocketService } from '../../../../core';
import { OverlayComponentState } from './overlay-component-state';

@Component({
  selector: 'app-overlay',
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss'
})
export class OverlayComponent {
  //#region Private readonly Fields -------------------------------------------
  private readonly sessionSvc: SessionService;
  private readonly socketSvc: SocketService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected showPause: Signal<boolean>;
  protected connectionIcon: Signal<string>;
  protected countdownState: Signal<OverlayComponentState>;
  //#endregion

  //#region Getters: Labels ----------------------------------------------------
  public get reconnectNowButton(): string {
    return extract('Team.Overlay.Component.Button.Reconnect_now');
  }

  public get giveUpReconnectingButton(): string {
    return extract('Team.Overlay.Component.Button.Give_up_reconnecting');
  }

  public get havingABreakTextLine(): string {
    return extract('Team.Overlay.Component.Text.Enjoy_your_break');
  }
  public get rejoinNowButton(): string {
    return extract('Team.Overlay.Component.Button.Rejoin_now');
  }

  public get notRejoining(): string {
    return extract('Team.Overlay.Component.Button.Not_rejoining');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionSvc: SessionService, socketSvc: SocketService) {
    this.sessionSvc = sessionSvc;
    this.socketSvc = socketSvc;

    this.connectionIcon = computed(() => {
      switch (socketSvc.socketState()) {
        case ESocketState.Connected:
          return 'cloud';
        case ESocketState.Connecting:
        case ESocketState.Reconnecting:
          return 'cloud_queue';
        case ESocketState.Disconnecting:
        case ESocketState.Disconnected:
        case ESocketState.ReconnectPending:
          return 'cloud_off';
      }
    });

    this.showPause = computed(() => {
      return sessionSvc.sessionState() == ESessionState.Suspended;
    });

    this.countdownState = computed(() => {
      const resumeIn = socketSvc.resumeIn();
      let result: OverlayComponentState;
      if (resumeIn > 0) {
        result = {
          showCountdown: true,
          reconnectingTextKey:
            resumeIn > 1
              ? extract('Overlay.Component.Text.Reconnect_in_$seconds_seconds')
              : extract('Overlay.Component.Text.Reconnect_in_1_second')
        };
      } else {
        result = {
          showCountdown: false
        };
      }
      return result;
    });
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public reconnectNowButtonClick(): void {
    this.sessionSvc.rejoinSession(this.sessionSvc.teamName()!, this.sessionSvc.me()!.participantId);
  }

  public giveUpReconnectingButtonClick(): void {
    this.socketSvc.giveUpReconnecting();
  }

  public doNotRejoinButtonClick(): void {
    this.sessionSvc.leaveDisconnectedSession(this.sessionSvc.teamName()!, this.sessionSvc.me()!.participantId);
  }
  //#endregion
}
