import { inject, Service } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { AClientMessage, AServerMessage, EParticipantStatus, ERole } from 'shared-lib';
import { RejoinMessage } from '../../shared/dto';
import { LocalStorageService } from './local-storage.service';
import { Logger } from './logger';
import { Member } from './member';
import { ESessionStatus } from './session-status.enum';
import { UiEventsService } from './ui-events.service';

@Service()
export class SocketService {
  //#region private readonly properties ---------------------------------------
  private readonly localStorageSvc: LocalStorageService;
  private readonly log: Logger;
  private readonly uiEventsSvc: UiEventsService;
  //#endregion

  //#region private properties ------------------------------------------------
  private initialMessage?: AClientMessage;
  private me: Member;
  private resumeTimer?: number;
  private webSocket: WebSocket | null;
  //#endregion

  //#region public properties -------------------------------------------------
  public readonly incomingMessage: ReplaySubject<AServerMessage>;
  public readonly reset: Subject<void>;
  public resumeIn: number;
  public status: ESessionStatus;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.localStorageSvc = inject(LocalStorageService);
    this.log = new Logger('SocketService');
    this.uiEventsSvc = inject(UiEventsService);
    this.me = new Member(
      {
        nick: '',
        observer: true,
        role: ERole.Unknown,
        status: EParticipantStatus.Unknown,
        participantId: ''
      },
      true
    );
    this.resumeIn = 0;
    this.webSocket = null;
    this.incomingMessage = new ReplaySubject<AServerMessage>();
    this.reset = new Subject<void>();
    this.status = ESessionStatus.Inactive;
  }
  //#endregion

  //#region Session Lifecycle methods -----------------------------------------

  public quitSession(): void {
    this.log.warn('Not implemented');
  }

  public rejoin(): void {
    window.clearInterval(this.resumeTimer);
    const team = this.localStorageSvc.teamName;
    const participantId = this.localStorageSvc.participantId;
    if (team && participantId) {
      this.log.debug(`rejoining ${team} as ${participantId}`);
      if (this.status !== ESessionStatus.ReconnectPending) {
        this.status = ESessionStatus.Reconnecting;
      } else {
        this.status = ESessionStatus.Resuming;
      }
      this.initialMessage = new RejoinMessage('', participantId);
      this.connect(team);
    } else {
      this.uiEventsSvc.showWarning('Session.Service.Warning.Can_not_rejoin');
      this.resetServices();
    }
  }

  public suspendSession(): void {
    this.log.warn('not implemented');
  }
  //#endregion

  //#region Websocket methods -------------------------------------------------
  public connect(teamName: string): void {
    // const url = `${environment.ws}/${encodeURI(teamName)}`;
    const url = `ws://localhost:3001/ws/game/${encodeURI(teamName)}`;
    this.log.debug('opening ws using url' + url);
    this.webSocket = new WebSocket(url);
    this.webSocket.onopen = this.onOpen.bind(this);
    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
  }

  public disconnect(): void {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      this.webSocket.close(1000);
    }
  }

  public sendMessage(message: AClientMessage): void {
    if (this.canPerformActionOnSocket()) {
      this.log.debug(`=> ${message.type}`, message.data);
      this.webSocket?.send(JSON.stringify(message));
    }
  }
  //#endregion

  //#region Auxiliary methods: Websocket events -------------------------------
  private onOpen(_event: Event): void {
    this.log.debug(`Successfully connected to ${this.webSocket?.url}`);
    this.status = ESessionStatus.Initiating;
  }

  private onClose(event: CloseEvent): void {
    if (event.code == 1006) {
      switch (this.status) {
        case ESessionStatus.Connecting:
          this.log.debug('in onClose case: Starting');
          this.uiEventsSvc.showError('Socket.Error.Could_not_connect');
          this.status = ESessionStatus.Inactive;
          break;
        case ESessionStatus.Resuming:
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
    this.incomingMessage.next(message);
  }

  private onError(_event: Event): void {
    if (this.status !== ESessionStatus.Resuming && this.status != ESessionStatus.Connecting) {
      this.log.debug(`in onError not connecting and not reconnecting : ${this.status}`);
      this.uiEventsSvc.showError('Socket.Error.Communication_error');
    }
  }
  //#endregion

  //#region Auxiliary methods: reconnect --------------------------------------
  private initiateAutomaticReconnect(): void {
    this.resumeIn = 30;
    this.status = ESessionStatus.ReconnectPending;
    this.resumeTimer = window.setInterval(this.reconnectTick.bind(this), 1000);
  }

  private reconnectTick(): void {
    this.resumeIn--;
    if (this.resumeIn === 0) {
      this.rejoin();
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

  private resetServices(): void {
    this.status = ESessionStatus.Inactive;
    this.disconnect();
    this.reset.next();
    this.navigateTo('/home');
  }

  private navigateTo(_route: string): void {
    // if (this.currentRoute !== route) {
    //   this.log.debug(`navigating to '${route}'`);
    //   this.router.navigate([route]);
    // }
  }
  //#region
}
