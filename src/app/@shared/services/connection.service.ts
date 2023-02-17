import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

import { ClientMessage, EServerMessageType, IInitMessage, ServerMessage } from '@shared-lib';
import { EConnectionStatus } from './connection-status.enum';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  //#region private properties ------------------------------------------------
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  private currentReconnectIn: number;
  private rejoinCallBack?: () => void;
  private reconnectTimer: number;
  private webSocket: WebSocket | null;
  private messageHandler?: (msg: ServerMessage) => void;
  private initialMessage?: ClientMessage
  //#endregion

  //#region Public properties -------------------------------------------------
  public connectionStatus: EConnectionStatus;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get reconnectIn(): number {
    return this.currentReconnectIn;
  }

  public get canAutomaticallyReconnect(): boolean {
    return this.rejoinCallBack !== null;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(snackbarService: SnackbarService, translateService: TranslateService) {
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.connectionStatus = EConnectionStatus.Disconnected;
    this.currentReconnectIn = 0;
    this.reconnectTimer = 0;
    this.webSocket = null;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public connect(
    teamName: string,
    initialMessage: ClientMessage,
    messageHandler: (msg: ServerMessage) => void,
    rejoinCallBack: () => void): void {

    this.rejoinCallBack = rejoinCallBack;
    this.messageHandler = messageHandler;
    this.initialMessage = initialMessage;
    this.connectionStatus = EConnectionStatus.Connecting;
    const url = `${environment.ws}/${encodeURI(teamName)}`
    this.webSocket = new WebSocket(url);
    this.webSocket.onopen = this.onOpen.bind(this);
    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
  }

  public disconnect(): void {
    this.webSocket?.close();
  }

  public sendMessage(message: ClientMessage): void {
    this.webSocket?.send(JSON.stringify(message));
  }

  public reconnectNow(): void {
    if (this.rejoinCallBack) {
      this.rejoinCallBack();
    }
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private initiateReconnectTimer(): void {
    if (this.rejoinCallBack) {
      this.currentReconnectIn = 30;
      this.connectionStatus = EConnectionStatus.Countdown;
      this.reconnectTimer = window.setInterval(this.reconnectTick.bind(this), 1000, this.rejoinCallBack);
    }
  }

  private onOpen(event: Event): void {
    this.connectionStatus = EConnectionStatus.Connected;
    console.log(`Successfully connected to ${this.webSocket?.url}`);
  }

  private onClose(event: CloseEvent): void {
    console.log(event);
    if (event.code == 1006) {
      this.showMessage(this.translateService.instant('Socket.Error.Could_not_connect'));
    }
    // else if (event.wasClean && this.connectionStatus !== EConnectionStatus.Disconnecting) {
    //   this.showMessage(this.translateService.instant('Game.Snackbar.Disconnected'));
    // }
    this.connectionStatus = EConnectionStatus.Disconnected;
    this.webSocket = null;
  }

  private onMessage(event: MessageEvent<string>): void {
    const message: ServerMessage = JSON.parse(event.data);
    if (message.type == EServerMessageType.Init && this.initialMessage) {
      this.initialMessage.senderUuid = (<IInitMessage>message).data.uuid;
      this.sendMessage(this.initialMessage);
      this.initialMessage = undefined;
    }
    this.messageHandler!(message);
  }

  private onError(event: Event): void {
    if (this.connectionStatus !== EConnectionStatus.Connecting) {
      console.log(event);
      this.showMessage(this.translateService.instant('Socket.Error.Communication_error'))
    }
  }

  private reconnectTick(callback: () => void) {
    this.currentReconnectIn--;
    if (this.currentReconnectIn === 0) {
      window.clearInterval(this.reconnectTimer);
      callback();
    }
  }

  private showMessage(message: string): void {
    this.snackbarService.showError(message);
  }
  //#endregion
}
