import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, Observable, ReplaySubject, Subject } from 'rxjs';

import { AClientMessage, AServerMessage, ECardSet, EParticipantStatus, ERole, EServerMessageType, ICardSet, IErrorMessage, IInitMessage, ISelfMessage } from '@shared-lib';

import { Logger } from '@core/services/logger.service';
import { environment } from '@env/environment';
import { MessageBoxComponent } from '../components/message-box/message-box.component';
import { MessageBoxParams } from '../components/message-box/message-box.params';
import { CreateMessage, JoinMessage, LeaveMessage, PauseMessage, RejoinMessage } from '../messages';
import { ICanRejoinResult } from './can-rejoin-result';
import { ErrorHandlerService } from './error-handler.service';
import { HttpService } from './http.service';
import { LocalStorageService } from './local-storage.service';
import { Member } from './member';
import { ESessionStatus } from './session-status.enum';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  //#region private readonly properties ---------------------------------------
  private readonly dialog: MatDialog;
  private readonly errorHandlerService: ErrorHandlerService;
  private readonly httpService: HttpService;
  private readonly localStorage: LocalStorageService;
  private readonly router: Router;
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  private readonly log: Logger;
  //#endregion

  //#region private properties ------------------------------------------------
  private currentRoute: string;
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

  //#region getters -----------------------------------------------------------
  public get scrumMaster(): boolean {
    return this.me.role === ERole.ScrumMaster;
  }

  public get myParticipantId(): string {
    return this.me.participantId;
  }

  public get myStatus(): EParticipantStatus {
    return this.me.status;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialog: MatDialog,
    errorHandlerService: ErrorHandlerService,
    httpService: HttpService,
    localStorage: LocalStorageService,
    router: Router,
    snackbarService: SnackbarService,
    translateService: TranslateService) {
    // assign the private readonly properties
    this.dialog = dialog;
    this.errorHandlerService = errorHandlerService;
    this.httpService = httpService;
    this.localStorage = localStorage;
    this.router = router;
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.log = new Logger('SessionService');
    // initialize the private properties
    this.currentRoute = '/';
    this.me = new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, participantId: '' }, true);
    this.webSocket = null;
    // initialize the public readonly properties
    this.incomingMessage = new ReplaySubject<AServerMessage>();
    this.reset = new Subject<void>();
    // initialize the public properties
    this.resumeIn = 0;
    this.status = ESessionStatus.Inactive;
    // subscribe to router
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd)) // eslint-disable-line
      .subscribe(event => this.currentRoute = event.urlAfterRedirect);
  }
  //#endregion

  //#region public session related methods ---------------------------------
  public createSession(team: string, nick: string, observer: boolean, cardSet: ECardSet, cards: ICardSet | undefined): void {
    this.log.debug(`creating: ${nick}@${team}`);
    this.status = ESessionStatus.Connecting;
    this.initialMessage = new CreateMessage(
      '',
      {
        observer: observer || false,
        nick: nick,
        cardSet: cardSet,
        cards: cards
      }
    );
    this.connect(team);
  }

  public joinSession(team: string, nick: string, observer: boolean): void {
    this.log.debug(`joining: ${nick}@${team}`);
    this.status = ESessionStatus.Connecting;
    this.initialMessage = new JoinMessage(
      '',
      {
        observer: observer,
        nick: nick
      }
    );
    this.connect(team);
  }

  public rejoin(): void {
    window.clearInterval(this.resumeTimer);
    const team = this.localStorage.teamName;
    const participantId = this.localStorage.participantId;
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
      this.snackbarService.showWarning(this.translateService.instant('Session.Service.Warning.Can_not_rejoin'));
      this.resetServices();
    }
  }

  public quitSession(): void {
    window.clearInterval(this.resumeTimer);
    const team = this.localStorage.teamName;
    const participantId = this.localStorage.participantId;
    if (participantId && team) {
      const message = new LeaveMessage(participantId, participantId);
      if (this.scrumMaster) {
        const params = new MessageBoxParams();
        params.cancelButtonLabel = this.translateService.instant('Button.Generic.Label.No');
        params.okButtonLabel = this.translateService.instant('Button.Generic.Label.Yes');
        params.text = this.translateService.instant('MessageBox.Do_you_want_to_end_the_session.Text');
        params.title = this.translateService.instant('MessageBox.Do_you_want_to_end_the_session.Title');

        const dialogRef = this.dialog.open(MessageBoxComponent, {
          width: '250px',
          data: params
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.sendMessage(message);
          }
        });
      } else {
        switch (this.status) {
          case ESessionStatus.Active:
            this.status = ESessionStatus.Stopping;
            this.sendMessage(message);
            break;
          case ESessionStatus.ReconnectPending:
            this.status = ESessionStatus.Inactive;
            this.resetServices();
            this.localStorage.clear();
            break;
          case ESessionStatus.Suspended:
            this.initialMessage = message;
            this.status = ESessionStatus.Resuming;
            this.connect(team);
        }

      }
    } else {
      this.localStorage.clear();
    }
  }

  public suspendSession(): void {
    if (this.scrumMaster) {
      const params = new MessageBoxParams();
      params.showCancelButton = false;
      params.okButtonLabel = this.translateService.instant('Button.Generic.Label.OK');
      params.text = this.translateService.instant('MessageBox.Assign_another_scrum_master_first.Text');
      params.title = this.translateService.instant('MessageBox.Assign_another_scrum_master_first.Title');

      this.dialog.open(MessageBoxComponent, {
        width: '350px',
        data: params
      });
    } else {
      const message = new PauseMessage(this.myParticipantId);
      this.sendMessage(message);
    }
  }

  public canRejoin(): Observable<ICanRejoinResult> {
    const nick = this.localStorage.nick;
    const team = this.localStorage.teamName;
    const participantId = this.localStorage.participantId;
    if (team && nick && participantId) {
      this.status = ESessionStatus.Suspended;
      return this.httpService.checkCanRejoin(team, participantId).pipe(map((can: boolean) => {
        const result: ICanRejoinResult = {
          nick: nick,
          team: team,
          canRejoin: can
        };
        return result;
      }));
    }
    else {
      const result: ICanRejoinResult = {
        nick: nick,
        team: team,
        canRejoin: false
      };
      return new Observable((subscriber) => { subscriber.next(result) });
    }
  }

  public clearSessionData(): void {
    this.localStorage.clear();
    this.resetServices();
  }

  public stopReconnecting(): void {
    this.status = ESessionStatus.Inactive;
    this.navigateTo('/home');
  }
  //#endregion

  //#region Websocket related methods -----------------------------------------
  public connect(teamName: string): void {
    const url = `${environment.ws}/${encodeURI(teamName)}`
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
      this.log.debug(`=> ${message.type}`, message.data)
      this.webSocket?.send(JSON.stringify(message));
    }
  }

  private onOpen(_event: Event): void {
    this.log.debug(`Successfully connected to ${this.webSocket?.url}`);
    this.status = ESessionStatus.Initiating;
  }

  private onClose(event: CloseEvent): void {
    if (event.code == 1006) {
      switch (this.status) {
        case ESessionStatus.Connecting:
          this.log.debug('in onClose case: Starting')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.Could_not_connect'));
          this.status = ESessionStatus.Inactive;
          break;
        case ESessionStatus.Resuming:
          this.log.debug('in onClose case: Resuming')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.Unable_to_reestablish_the_connection'));
          this.initiateAutomaticReconnect();
          break;
        default:
          this.log.debug('in onClose case: default')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.You_Have_been_disconnected'));
          this.initiateAutomaticReconnect();
      }
    } else {
      if (event.code !== 1000) {
        this.log.debug('in onClose event code', event);
        this.snackbarService.showError(this.translateService.instant('Socket.Error.You_Have_been_disconnected'));
      }

    }
    this.webSocket = null;
  }

  private onMessage(event: MessageEvent<string>): void {
    const message: AServerMessage = JSON.parse(event.data);
    this.log.debug(`<= ${message.type}`, message.data);
    this.handleServerMessage(message)
    this.incomingMessage.next(message);
  }

  private onError(_event: Event): void {
    if (this.status !== ESessionStatus.Resuming && this.status != ESessionStatus.Connecting) {
      this.log.debug(`in onError not connecting and not reconnecting : ${this.status}`);
      this.snackbarService.showError(this.translateService.instant('Socket.Error.Communication_error'));
    }
  }

  private canPerformActionOnSocket(): boolean {
    if (this.webSocket?.readyState === WebSocket.OPEN) {
      return true;
    } else {
      this.snackbarService.showError(this.translateService.instant('Socket.Error.There_is_no_connection_with_the_server'));
      return false;
    }
  }
  //#endregion

  //#region Private message handling methods ----------------------------------
  private handleServerMessage(message: AServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Error:
        this.handleError(<IErrorMessage>message)
        break;
      case EServerMessageType.EndSession:
        this.handleEndSession();
        break;
      case EServerMessageType.ServerReset:
        this.handleServerReset();
        break;
      case EServerMessageType.TeamIdle:
        this.handleTeamIdle();
        break;
      case EServerMessageType.Init:
        this.handleInit(<IInitMessage>message)
        break;
      case EServerMessageType.Self:
        this.handleSelf(<ISelfMessage>message);
        break;
    }
  }

  private handleEndSession(): void {
    if (this.me.role !== ERole.ScrumMaster) {
      const params = new MessageBoxParams();
      params.showCancelButton = false;
      params.title = this.translateService.instant('MessageBox.The_scrummaster_has_ended_the_session.Title');
      params.text = this.translateService.instant('MessageBox.The_scrummaster_has_ended_the_session.Text');

      this.dialog.open(MessageBoxComponent, {
        width: '250px',
        data: params
      });
    }
    this.resetServices();
  }

  private handleError(message: IErrorMessage): void {
    if (this.errorHandlerService.handleErrorMessage(message)) {
      this.resetServices();
    }
  }

  private handleInit(message: IInitMessage): void {
    if (this.initialMessage) {
      this.initialMessage.senderId = message.data.participantId;
      this.sendMessage(this.initialMessage);
      this.initialMessage = undefined;
    }
    this.me = new Member(message.data, true);
    this.localStorage.participantId = this.me.participantId;
    this.status = ESessionStatus.Active;
    this.navigateTo('/game');
  }

  private handleSelf(message: ISelfMessage): void {
    if (message.data.status === EParticipantStatus.Left) {
      this.localStorage.clear();
      this.resetServices();
    } else {
      if (this.me.role === ERole.Developer && message.data.role === ERole.ScrumMaster) {
        this.snackbarService.showInfo(
          this.translateService.instant('Game.Snackbar.You_are_now_scrum-master')
        );
      }
      this.me = new Member((<ISelfMessage>message).data, true);
      this.localStorage.nick = this.me.nick;
      this.localStorage.participantId = this.me.participantId;
      if (this.me.status === EParticipantStatus.Paused) {
        this.status = ESessionStatus.Suspended;
        this.disconnect();
      }
    }
  }

  private handleServerReset(): void {
    const params = new MessageBoxParams();
    params.showCancelButton = false;
    params.title = this.translateService.instant('MessageBox.The_server_has_been_reset.Title');
    params.text = this.translateService.instant('MessageBox.The_server_has_been_reset.Text');
    this.dialog.open(MessageBoxComponent, {
      width: '250px',
      data: params
    });
    this.resetServices();
  }

  private handleTeamIdle(): void {
    const params = new MessageBoxParams();
    params.showCancelButton = false;
    params.title = this.translateService.instant('MessageBox.The_was_idle_for_to_long.Title');
    params.text = this.translateService.instant('MessageBox.The_was_idle_for_to_long.Text');
    this.dialog.open(MessageBoxComponent, {
      width: '250px',
      data: params
    });
    this.resetServices();
  }
  //#endregion

  //#region private automatic reconnect related methods -----------------------
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

  //#region private helper methods --------------------------------------------
  private resetServices() {
    this.status = ESessionStatus.Inactive;
    this.disconnect();
    this.reset.next();
    this.navigateTo('/home');
  }

  private navigateTo(route: string): void {
    if (this.currentRoute !== route) {
      this.log.debug(`navigating to '${route}'`);
      this.router.navigate([route]);
    }
  }
  //#endregion

}
