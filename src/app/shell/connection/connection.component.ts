import { Component, OnInit } from '@angular/core';

import { ConnectionStatus, ConnectionService } from '@core';
import { GameService } from '../../game/game.service';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit {

  // <editor-fold desc='Public getter methods'>
  public get connectionIcon():string {

    switch (this.connectionService.connectionStatus) {
      case ConnectionStatus.Disconnected:
      case ConnectionStatus.Connecting:
      case ConnectionStatus.Countdown: {
        return 'cloud_off';
        break;
      }
      case ConnectionStatus.Connected: {
        return 'cloud';
      }
    }
  }

  public get reconnectingText(): string {
    return `Reconnecting in ${this.connectionService.reconnectIn} seconds`;
  }

  public get showConnection(): boolean {
    return this.connectionService.connectionStatus !== ConnectionStatus.Disconnected;
  }

  public get showReconnecting(): boolean {
    return this.connectionService.connectionStatus === ConnectionStatus.Countdown;
  }

  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private connectionService: ConnectionService,
    private gameService: GameService) { }
  // </editor-fold>

  // <editor-fold desc='Angular interface metods'>
  public ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
  public reconnect(): void {
    this.gameService.rejoin();
  }
  // </editor-fold>
}
