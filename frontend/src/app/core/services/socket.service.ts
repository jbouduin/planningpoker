import { inject, Service, signal, WritableSignal } from '@angular/core';
import { AClientMessage, AServerMessage } from 'shared-lib';
import { LocalStorageService } from './local-storage.service';
import { Logger } from './logger';
import { MessageDispatcherService } from './message-dispatcher.service';
import { ESocketState } from './socket-state.enum';
import { UiEventsService } from './ui-events.service';

@Service()
export class SocketService {
  //#region private readonly properties ---------------------------------------
  private readonly messageAdapterSvc: MessageDispatcherService;
  private readonly localStorageSvc: LocalStorageService;
  private readonly log: Logger;
  private readonly uiEventsSvc: UiEventsService;
  //#endregion

  //#region private properties ------------------------------------------------
  // TODO implement resuming
  private resumeTimer?: number;
  private webSocket: WebSocket | null;
  //#endregion

  //#region Signal ------------------------------------------------------------
  public readonly socketStatus: WritableSignal<ESocketState>;
  //#endregion

  //#region public properties -------------------------------------------------
  public resumeIn: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.messageAdapterSvc = inject(MessageDispatcherService);
    this.localStorageSvc = inject(LocalStorageService);
    this.log = new Logger('SocketService');
    this.uiEventsSvc = inject(UiEventsService);
    this.socketStatus = signal<ESocketState>(ESocketState.Disconnected);
    this.resumeIn = 0;
    this.webSocket = null;
  }
  //#endregion

  //#region Websocket methods -------------------------------------------------
  public connect(teamName: string): void {
    this._connect(teamName, ESocketState.Connecting);
  }

  public disconnect(code?: number): void {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      this.socketStatus.set(ESocketState.Disconnecting);
      this.webSocket.close(code);
    }
  }

  public sendMessage(message: AClientMessage): void {
    if (this.canPerformActionOnSocket()) {
      this.log.debug(`=> ${message.type}`, message.data);
      this.webSocket?.send(JSON.stringify(message));
    }
  }
  //#endregion

  //#region Auxiliary methods: socket methods ---------------------------------
  private _connect(teamName: string, status: ESocketState.Reconnecting | ESocketState.Connecting): void {
    // TODO const url = `${environment.ws}/${encodeURI(teamName)}`;
    this.socketStatus.set(status);
    const url = `ws://localhost:3001/ws/game/${encodeURI(teamName)}`;
    this.log.debug('opening ws using url' + url);
    this.webSocket = new WebSocket(url);
    this.webSocket.onopen = this.onOpen.bind(this);
    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
  }
  //#endregion

  //#region Auxiliary methods: Websocket events -------------------------------
  private onOpen(_event: Event): void {
    this.log.debug(`Successfully connected to ${this.webSocket?.url}`);
    this.socketStatus.set(ESocketState.Connected);
  }

  private onClose(event: CloseEvent): void {
    if (event.code == 1006) {
      switch (this.socketStatus()) {
        case ESocketState.Connecting:
          this.log.debug('in onClose case: Starting');
          this.uiEventsSvc.showError('Socket.Error.Could_not_connect');
          this.socketStatus.set(ESocketState.Disconnected);
          break;
        case ESocketState.Reconnecting:
          this.log.debug('in onClose case: Resuming');
          this.uiEventsSvc.showError('Socket.Error.Unable_to_reestablish_the_connection');
          this.initiateAutomaticReconnect();
          break;
        default:
          this.log.debug('in onClose case: default');
          this.uiEventsSvc.showError('Socket.Error.You_Have_been_disconnected');
          this.initiateAutomaticReconnect();
      }
    } else {
      if (event.code !== 1000) {
        this.log.debug('in onClose event code', event);
        this.uiEventsSvc.showError('Socket.Error.You_Have_been_disconnected');
      }
    }
    this.webSocket = null;
  }

  private onMessage(event: MessageEvent<string>): void {
    const message: AServerMessage = JSON.parse(event.data) as AServerMessage;
    this.log.debug(`<= ${message.type}`, message.data);
    const canContinue = this.messageAdapterSvc.processServerMessage(message);
    if (!canContinue) {
      this.disconnect(1000);
    }
  }

  private onError(_event: Event): void {
    const status = this.socketStatus();
    if (status !== ESocketState.Reconnecting && status != ESocketState.Connecting) {
      this.log.debug(`in onError not connecting and not reconnecting : ${status}`);
      this.uiEventsSvc.showError('Socket.Error.Communication_error');
    }
  }
  //#endregion

  //#region Auxiliary methods: reconnect --------------------------------------
  private initiateAutomaticReconnect(): void {
    this.resumeIn = 30;
    this.socketStatus.set(ESocketState.ReconnectPending);
    this.resumeTimer = window.setInterval(this.reconnectTick.bind(this), 1000);
  }

  private reconnectTick(): void {
    this.resumeIn--;
    if (this.resumeIn === 0) {
      this._connect(this.localStorageSvc.teamName!, ESocketState.Reconnecting);
    }
  }
  //#endregion

  //#region Auxiliary methods: other ------------------------------------------
  private canPerformActionOnSocket(): boolean {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      return true;
    } else {
      this.uiEventsSvc.showError('Socket.Error.There_is_no_connection_with_the_server');
      return false;
    }
  }
  //#region
}
