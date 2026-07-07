import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ESocketState, extract, SessionService, SocketService } from '../../../../core';
import { OverlayComponentState } from './overlay.component.state';

@Component({
  selector: 'app-overlay',
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss'
})
export class OverlayComponent {
  //#region Translation keys --------------------------------------------------
  protected readonly RECONNECT_NOW_LABEL = extract('Game.Overlay.Button.Reconnect_now');
  protected readonly GIVE_UP_RECONNECTING_LABEL = extract('Game.Overlay.Button.Give_up_reconnecting');
  protected readonly HAVING_A_BREAK_TEXT = extract('Game.Overlay.Text.Enjoy_your_break');
  protected readonly REJOIN_NOW_LABEL = extract('Game.Overlay.Button.Rejoin_now');
  protected readonly NOT_REJOINING_LABEL = extract('Game.Overlay.Button.Not_rejoining');
  //#endregion

  //#region Private readonly Fields -------------------------------------------
  private readonly sessionSvc: SessionService;
  private readonly socketSvc: SocketService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected connectionIcon: Signal<string>;
  protected componentState: Signal<OverlayComponentState>;
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

    this.componentState = computed(() => {
      const resumeIn = socketSvc.resumeIn();

      let result: OverlayComponentState;
      if (resumeIn > 0) {
        result = {
          showCountdown: true,
          showPause: false,
          reconnectingTextKey:
            resumeIn > 1
              ? extract('Game.Overlay.Text.Reconnect_in_$seconds_seconds')
              : extract('Game.Overlay.Text.Reconnect_in_1_second'),
          reconnectingTextParams: { seconds: resumeIn }
        };
      } else {
        result = {
          showCountdown: false,
          showPause: true
        };
      }
      return result;
    });
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public reconnectNowButtonClick(): void {
    this.sessionSvc.rejoinSession(this.sessionSvc.team()!.teamName, this.sessionSvc.me()!.participantId);
  }

  public giveUpReconnectingButtonClick(): void {
    this.socketSvc.giveUpReconnecting();
  }

  public doNotRejoinButtonClick(): void {
    this.sessionSvc.leaveDisconnectedSession(this.sessionSvc.team()!.teamName, this.sessionSvc.me()!.participantId);
  }
  //#endregion
}
