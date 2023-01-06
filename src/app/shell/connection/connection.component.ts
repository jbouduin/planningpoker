import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ConnectionStatus, ConnectionService } from '@core';
import { GameService } from '../../game/game.service';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent {

  //#region private properties ------------------------------------------------
  private translateService: TranslateService;
  private connectionService: ConnectionService;
  private gameService: GameService;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get connectionIcon(): string {

    switch (this.connectionService.connectionStatus) {
      case ConnectionStatus.Disconnected:
      case ConnectionStatus.Connecting:
      case ConnectionStatus.Countdown: {
        return 'cloud_off';
      }
      case ConnectionStatus.Connected: {
        return 'cloud';
      }
    }
  }

  public get reconnectingText(): string {
    if (this.connectionService.reconnectIn > 1) {
      return this.translateService.instant(
        'Connection.Component.Text.Reconnect_in_$seconds_seconds',
        { seconds: this.connectionService.reconnectIn });

    } else {
      return this.translateService.instant('Connection.Component.Text.Reconnect_in_1_second');
    }
  }

  public get reconnectNowButtonLabel(): string {
    return this.translateService.instant('Connection.Component.ButtonLabel.Reconnect_now');
  }

  public get showConnection(): boolean {
    return this.connectionService.connectionStatus !== ConnectionStatus.Disconnected;
  }

  public get showReconnecting(): boolean {
    return this.connectionService.connectionStatus === ConnectionStatus.Countdown;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    translateService: TranslateService,
    connectionService: ConnectionService,
    gameService: GameService) {
    this.translateService = translateService;
    this.connectionService = connectionService;
    this.gameService = gameService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public reconnect(): void {
    this.gameService.rejoin();
  }
  //#endregion
}
