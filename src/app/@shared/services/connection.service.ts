import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

import { ClientMessage, ServerMessage } from '@shared-lib';
import { ReplaySubject, Subject } from 'rxjs';
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
  private rejoinCallBack: (() => void) | null;
  private reconnectTimer: number;
  private webSocket: WebSocket | null;
  //#endregion

  //#region Public properties -------------------------------------------------
  public connectionStatus: EConnectionStatus;
  public incomingMessage: ReplaySubject<ServerMessage>;
  public reset: Subject<void>;
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
    this.rejoinCallBack = null;
    this.webSocket = null;
    this.incomingMessage = new ReplaySubject<ServerMessage>(100);
    this.reset = new Subject<void>();
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public connect(
    teamName: string,
    rejoinCallBack: () => void): void {
    this.rejoinCallBack = rejoinCallBack;
    if (this.connectionStatus !== EConnectionStatus.Reconnecting) {
      this.connectionStatus = EConnectionStatus.Connecting;
    }
    const url = `${environment.ws}/${encodeURI(teamName)}`
    this.webSocket = new WebSocket(url);
    this.webSocket.onopen = this.onOpen.bind(this);
    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
  }

  public disconnect(): void {
    if (this.connectionStatus == EConnectionStatus.Reconnecting) {
      window.clearInterval(this.reconnectTimer);
    } else if (this.canPerformActionOnSocket()) {
      this.webSocket?.close(1000);
    }
  }

  public sendMessage(message: ClientMessage): void {
    if (this.canPerformActionOnSocket()) {
      this.webSocket?.send(JSON.stringify(message));
    }
  }

  public reconnectNow(): void {
    window.clearInterval(this.reconnectTimer);
    this.connectionStatus = EConnectionStatus.Reconnecting;
    if (this.rejoinCallBack) {
      this.rejoinCallBack();
    }
  }

  public giveUpReconnecting(): void {
    window.clearInterval(this.reconnectTimer);
    this.rejoinCallBack = null;
    this.connectionStatus = EConnectionStatus.Disconnected;
    this.reset.next();
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private initiateReconnectTimer(): void {
    if (this.rejoinCallBack) {
      this.currentReconnectIn = 30;
      this.connectionStatus = EConnectionStatus.Countdown;
      this.reconnectTimer = window.setInterval(this.reconnectTick.bind(this), 1000);
    }
  }
  //#endregion

  //#region Websocket events --------------------------------------------------
  private onOpen(_event: Event): void {
    this.connectionStatus = EConnectionStatus.Connected;
    console.log(`Successfully connected to ${this.webSocket?.url}`);
  }

  private onClose(event: CloseEvent): void {
    if (event.code == 1006) {
      switch (this.connectionStatus) {
        case EConnectionStatus.Connecting:
          console.log('in onClose case: connecting')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.Could_not_connect'));
          this.connectionStatus = EConnectionStatus.Disconnected;
          break;
        case EConnectionStatus.Reconnecting:
          console.log('in onClose case: reconnecting')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.Unable_to_reestablish_the_connection'));
          this.initiateReconnectTimer();
          break;
        default:
          console.log('in onClose case: default')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.You_Have_been_disconnected'));
          this.initiateReconnectTimer();
      }
    } else {
      if (event.code !== 1000) {
        console.log(`in onClose event code: ${event.code}`)
        this.snackbarService.showError(this.translateService.instant('Socket.Error.You_Have_been_disconnected'));
        console.log(event);
      }
      this.connectionStatus = EConnectionStatus.Disconnected;
    }
    this.webSocket = null;
  }

  private onMessage(event: MessageEvent<string>): void {
    this.incomingMessage.next(JSON.parse(event.data));
  }

  private onError(_event: Event): void {
    if (this.connectionStatus !== EConnectionStatus.Connecting && this.connectionStatus !== EConnectionStatus.Reconnecting) {
      console.log(`in onError not connecting and not reconnecting : ${this.connectionStatus}`);
      this.snackbarService.showError(this.translateService.instant('Socket.Error.Communication_error'));
    }
  }

  private reconnectTick() {
    this.currentReconnectIn--;
    if (this.currentReconnectIn === 0) {
      this.reconnectNow();
    }
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private canPerformActionOnSocket(): boolean {
    if (this.connectionStatus === EConnectionStatus.Connected && this.webSocket !== null) {
      return true;
    } else {
      this.snackbarService.showError(this.translateService.instant('Socket.Error.There_is_no_connection_with_the_server'));
      return false;
    }
  }
  //#endregion
}
