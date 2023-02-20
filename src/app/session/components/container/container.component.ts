import { Component } from '@angular/core';
import { ConnectionService, EConnectionStatus } from '@shared';

@Component({
  selector: 'session-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent {

  //#region private properties ------------------------------------------------
  private readonly connectionService: ConnectionService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get showOverlay(): boolean {
    return this.connectionService.connectionStatus !== EConnectionStatus.Connected;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(connectionService: ConnectionService) {
    // TODO NOW use session status suspended
    this.connectionService = connectionService;
  }
  //#endregion
}
