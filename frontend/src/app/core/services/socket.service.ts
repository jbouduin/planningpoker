import { inject, Service, Signal, signal, WritableSignal } from '@angular/core';
import {
  AClientMessageDto,
  AServerMessageDto,
  EServerMessageType,
  ESessionEndedReason,
  SessionEndedMessageDto
} from 'shared-lib';
import { ENVIRONMENT } from '../../../environments/environment';
import { LocalStorageService } from './local-storage.service';
import { Logger } from './logger';
import { MessageDispatcherService } from './message-dispatcher.service';
import { ESocketState } from './socket-state.enum';
import { UiEventsService } from './ui-events.service';

@Service()
export class SocketService {
  //#region Closure codes -----------------------------------------------------
  /**
   * **1000** (Normal Closure): The connection successfully completed the purpose for which it was created.
   */
  public static readonly CLOSE_CODE_NORMAL = 1000;
  /**
   * **1001** (Going away): The endpoint is going away, either because of a server failure or because the browser is navigating away from the page that opened the connection.
   */
  private static readonly CLOSE_CODE_GOING_AWAY = 1001;
  /**
   * **1005** (No Status Received): Reserved. Indicates that no status code was provided even though one was expected.
   */
  private static readonly CLOSE_CODE_NO_STATUS = 1005;
  /**
   * **1006** (Abnormal closure): Reserved. Indicates that a connection was closed abnormally (that is, with no close frame being sent) when a status code is expected.
   */
  private static readonly CLOSE_CODE_ABNORMAL = 1006;
  /**
   * **1012** (Server restart): The server is terminating the connection because it is restarting.
   */
  private static readonly CLOSE_CODE_SERVER_RESTART = 1012;
  /**
   * **1013** (Try again later): The server is terminating the connection due to a temporary condition, e.g., it is overloaded and is casting off some of its clients.
   */
  private static readonly CLOSE_CODE_TRY_AGAIN = 1013;
  //#endregion

  //#region private readonly properties ---------------------------------------
  private readonly messageDispatcherSvc: MessageDispatcherService;
  private readonly localStorageSvc: LocalStorageService;
  private readonly log: Logger;
  private readonly uiEventsSvc: UiEventsService;
  private readonly webSocketRoot: string;
  private readonly webSocketPath: string;
  //#endregion

  //#region private properties ------------------------------------------------
  // TODO implement automatic resuming
  private resumeTimer?: number;
  private webSocket: WebSocket | null;
  private _resumeIn: WritableSignal<number>;
  //#endregion

  //#region Signal ------------------------------------------------------------
  public readonly socketState: WritableSignal<ESocketState>;
  //#endregion

  //#region public properties -------------------------------------------------
  public get resumeIn(): Signal<number> {
    return this._resumeIn;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.messageDispatcherSvc = inject(MessageDispatcherService);
    this.localStorageSvc = inject(LocalStorageService);
    this.log = new Logger('SocketService');
    this.uiEventsSvc = inject(UiEventsService);
    this.socketState = signal<ESocketState>(ESocketState.Disconnected);
    this.webSocketRoot = ENVIRONMENT.webSocketHost;
    this.webSocketPath = ENVIRONMENT.webSocketPath;
    this._resumeIn = signal<number>(-1);
    this.webSocket = null;
  }
  //#endregion

  //#region Websocket methods -------------------------------------------------
  public connect(teamName: string): void {
    this._connect(teamName, ESocketState.Connecting);
  }

  /**
   * Close the socket with code 1000 (normal closure)
   */
  public disconnect(): void {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      this.socketState.set(ESocketState.Disconnecting);
      this.webSocket.close(SocketService.CLOSE_CODE_NORMAL);
    }
  }

  public simulateDisconnection(): void {
    if (ENVIRONMENT.environment === 'development' && this.webSocket?.readyState === WebSocket.OPEN) {
      this.webSocket.close();
    }
  }

  public sendMessage(message: AClientMessageDto): void {
    if (this.canPerformActionOnSocket()) {
      this.log.debug(`=> ${message.type}`, message.data);
      this.webSocket?.send(JSON.stringify(message));
    }
  }

  /**
   * Give up reconnecting by making the dispatcher service dispatch a SessionEndedDto
   * A case of *Listen to yourself* in the front end
   */
  public giveUpReconnecting(): void {
    window.clearInterval(this.resumeTimer);
    this.socketState.set(ESocketState.Disconnected);
    const sessionEndedMessageDto: SessionEndedMessageDto = {
      data: { reason: ESessionEndedReason.SelfInflicted },
      type: EServerMessageType.SessionEnded
    };
    this.messageDispatcherSvc.processServerMessage(sessionEndedMessageDto);
  }
  //#endregion

  //#region Auxiliary methods: socket methods ---------------------------------
  private _connect(teamName: string, status: ESocketState.Reconnecting | ESocketState.Connecting): void {
    window.clearInterval(this.resumeTimer);
    this._resumeIn.set(-1);
    const url = `${this.webSocketRoot}/${this.webSocketPath}/${encodeURI(teamName)}`;
    this.socketState.set(status);
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
    this.socketState.set(ESocketState.Connected);
  }

  /**
   * Code to handle the socket close event.
   *
   * Expected codes:
   *
   * - **1000** (Normal Closure): The connection successfully completed the purpose for which it was created.
   * - **1001** (Going away): The endpoint is going away, either because of a server failure or because the browser is navigating away from the page that opened the connection.
   * - **1006** (Abnormal closure): Reserved. Indicates that a connection was closed abnormally (that is, with no close frame being sent) when a status code is expected.
   * - **1012** (Server restart): The server is terminating the connection because it is restarting.
   * - **1013** (Try again later): The server is terminating the connection due to a temporary condition, e.g., it is overloaded and is casting off some of its clients.
   *
   * In development environment, when simulating a disconnection the Code is
   *
   * - **1005** (No Status Received): Reserved. Indicates that no status code was provided even though one was expected.
   *
   * @param event Close event see: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
   */
  private onClose(event: CloseEvent): void {
    if (
      event.code == SocketService.CLOSE_CODE_ABNORMAL ||
      event.code == SocketService.CLOSE_CODE_SERVER_RESTART ||
      event.code == SocketService.CLOSE_CODE_TRY_AGAIN ||
      event.code == SocketService.CLOSE_CODE_NO_STATUS
    ) {
      switch (this.socketState()) {
        case ESocketState.Connecting:
          this.log.debug('in onClose case: Starting');
          this.uiEventsSvc.showError('Socket.Error.Could_not_connect');
          this.socketState.set(ESocketState.Disconnected);
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
      if (event.code !== SocketService.CLOSE_CODE_NORMAL && event.code !== SocketService.CLOSE_CODE_GOING_AWAY) {
        this.log.debug('in onClose event: non catched code');
        this.uiEventsSvc.showError('Socket.Error.You_Have_been_disconnected');
      }
    }
    this.webSocket = null;
  }

  private onMessage(event: MessageEvent<string>): void {
    const message: AServerMessageDto = JSON.parse(event.data) as AServerMessageDto;
    this.log.debug(`<= ${message.type}`, message.data);
    const canContinue = this.messageDispatcherSvc.processServerMessage(message);
    // if we can not continue (team not found, etc...) → perform a normal close
    if (!canContinue) {
      this.disconnect();
    }
  }

  private onError(_event: Event): void {
    const status = this.socketState();
    if (status !== ESocketState.Reconnecting && status != ESocketState.Connecting) {
      this.log.debug(`in onError not connecting and not reconnecting : ${status}`);
      this.uiEventsSvc.showError('Socket.Error.Communication_error');
    }
  }
  //#endregion

  //#region Auxiliary methods: reconnect --------------------------------------
  private initiateAutomaticReconnect(): void {
    this._resumeIn.set(30);
    this.socketState.set(ESocketState.ReconnectPending);
    this.resumeTimer = window.setInterval(this.reconnectTick.bind(this), 1000);
  }

  private reconnectTick(): void {
    this._resumeIn.update((prev: number) => prev - 1);

    if (this.resumeIn() === 0) {
      window.clearInterval(this.resumeTimer);
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
