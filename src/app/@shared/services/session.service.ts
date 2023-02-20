import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, map } from 'rxjs/operators';

import { ClientMessage, ECardSet, EParticipantStatus, ERole, EServerMessageType, ICardSet, IInitMessage, ISelfMessage, ServerMessage } from '@shared-lib';

import { HttpService, LocalStorageService, MessageBoxComponent, MessageBoxParams, SnackbarService } from '@shared';
import { CreateMessage, JoinMessage, LeaveMessage, RejoinMessage } from '../messages';
import { ErrorHandlerService } from './error-handler.service';
import { Member } from './member';
import { PauseMessage } from '../messages/pause.message';
import { ICanRejoinResult } from './can-rejoin-result';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ESessionStatus } from './session-status.enum';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  //#region private readonly properties ---------------------------------------
  // private readonly connectionService: ConnectionService;
  private readonly dialog: MatDialog;
  private readonly errorHandlerService: ErrorHandlerService;
  private readonly httpService: HttpService;
  private readonly localStorage: LocalStorageService;
  private readonly router: Router;
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region private properties ------------------------------------------------
  private currentRoute: string;
  private initialMessage?: ClientMessage;
  private me: Member;
  private resumeTimer?: number;
  private webSocket: WebSocket | null;
  //#endregion

  //#region public properties -------------------------------------------------
  public incomingMessage: ReplaySubject<ServerMessage>;
  public resumeIn: number;
  public reset: Subject<void>;
  public status: ESessionStatus;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get scrumMaster(): boolean {
    return this.me.role === ERole.ScrumMaster;
  }

  public get myUuid(): string {
    return this.me.uuid;
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
    this.dialog = dialog;
    this.errorHandlerService = errorHandlerService;
    this.httpService = httpService;
    this.localStorage = localStorage;
    this.router = router;
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.currentRoute = '/';
    this.incomingMessage = new ReplaySubject<ServerMessage>();
    this.reset = new Subject<void>();
    this.resumeIn = 0;
    this.status = ESessionStatus.Inactive;
    this.webSocket = null;
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd)) // eslint-disable-line
      .subscribe(event => this.currentRoute = event.urlAfterRedirect);
    this.me = new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, uuid: '' }, true);
  }
  //#endregion

  //#region public session related methods ---------------------------------
  public createSession(team: string, nick: string, observer: boolean, cardSet: ECardSet, cards: ICardSet | undefined): void {
    console.log(`creating: ${nick}@${team}`);
    this.status = ESessionStatus.Starting;
    this.initialMessage = new CreateMessage(
      '',
      {
        team: team,
        observer: observer || false,
        nick: nick,
        cardSet: cardSet,
        cards: cards
      }
    );
    this.connect(team);
  }

  public joinSession(team: string, nick: string, observer: boolean): void {
    console.log(`joining: ${nick}@${team}`);
    this.status = ESessionStatus.Starting;
    this.initialMessage = new JoinMessage(
      '',
      {
        team: team,
        observer: observer,
        nick: nick
      }
    );
    this.connect(team);
  }

  public rejoin(): void {
    window.clearInterval(this.resumeTimer);
    const team = this.localStorage.team;
    const uuid = this.localStorage.uuid;
    if (team && uuid) {
      console.log(`rejoining  ${team} as ${uuid}`);
      if (this.status !== ESessionStatus.ResumePending) {
        this.status = ESessionStatus.Resuming;
      }
      this.initialMessage = new RejoinMessage('', uuid);
      this.connect(team);
    } else {
      // TODO NOW give a message
    }
  }

  public quitSession(): void {
    window.clearInterval(this.resumeTimer);
    const team = this.localStorage.team;
    const uuid = this.localStorage.uuid;
    if (uuid && team) {
      const message = new LeaveMessage(uuid, uuid);
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
            // TODO NOW check if required this.localStorage.clear();
          }
        });
      } else {
        switch (this.status) {
          case ESessionStatus.Active:
            this.status = ESessionStatus.Stopping;
            this.sendMessage(message);
            break;
          case ESessionStatus.ResumePending:
            // TODO now
            break;
          case ESessionStatus.Suspended:
          case ESessionStatus.Disconnected:
            this.initialMessage = message;
            this.status = ESessionStatus.Resuming;
            this.connect(team);
        }
        // TODO NOW check if required this.localStorage.clear();
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
      const message = new PauseMessage(this.myUuid)
      this.sendMessage(message);
    }
  }

  public canRejoin(): Observable<ICanRejoinResult> {
    const nick = this.localStorage.nick;
    const team = this.localStorage.team;
    const uuid = this.localStorage.uuid;
    if (team && nick && uuid) {
      return this.httpService.checkCanRejoin(team, uuid).pipe(map((can: boolean) => {
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
    this.status = ESessionStatus.Inactive;
  }

  public stopReconnecting(): void {
    this.status = ESessionStatus.Inactive;
    this.navigateTo('/home');
  }
  //#endregion


  //#region Private message handling methods ----------------------------------
  private handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Error:
        if (this.errorHandlerService.handleErrorMessage(message)) {
          this.resetServices();
        }
        break;
      case EServerMessageType.EndSession:
        this.handleEndSession();
        break;
      case EServerMessageType.Left:
        this.resetServices();
        break;
      case EServerMessageType.ServerReset:
        this.handleServerReset();
        break;
      case EServerMessageType.TeamIdle:
        this.handleTeamIdle();
        break;
      case EServerMessageType.Init:
        debugger;
        if (this.initialMessage) {
          this.initialMessage.senderUuid = (<IInitMessage>message).data.uuid;
          this.sendMessage(this.initialMessage);
          this.initialMessage = undefined;
        }
        this.me = new Member((<IInitMessage>message).data, true);
        this.localStorage.uuid = this.me.uuid;
        this.status = ESessionStatus.Active;
        this.navigateTo('/game');
        break;
      case EServerMessageType.Self:
        if (this.me.role === ERole.Developer && (<ISelfMessage>message).data.role === ERole.ScrumMaster) {
          this.snackbarService.showInfo(
            this.translateService.instant('Game.Snackbar.You_are_now_scrum-master')
          );
        }
        this.me = new Member((<ISelfMessage>message).data, true);
        this.localStorage.nick = this.me.nick;
        this.localStorage.uuid = this.me.uuid;
        if (this.me.status === EParticipantStatus.Paused) {
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
    this.status = ESessionStatus.ResumePending;
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
      console.log(`navigating to '${route}'`);
      this.router.navigate([route]);
    }
  }
  //#endregion

  //#region Websocket related methods -----------------------------------------
  public connect(teamName: string): void {
    // if (this.connectionStatus !== EConnectionStatus.Reconnecting) {
    //   this.connectionStatus = EConnectionStatus.Connecting;
    // }
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

  public sendMessage(message: ClientMessage): void {
    if (this.canPerformActionOnSocket()) {
      this.webSocket?.send(JSON.stringify(message));
    }
  }

  private onOpen(_event: Event): void {
    console.log(`Successfully connected to ${this.webSocket?.url}`);
  }

  private onClose(event: CloseEvent): void {
    if (event.code == 1006) {
      switch (this.status) {
        case ESessionStatus.Starting:
          console.log('in onClose case: Starting')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.Could_not_connect'));
          this.status = ESessionStatus.Inactive;
          break;
        case ESessionStatus.Resuming:
          console.log('in onClose case: Resuming')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.Unable_to_reestablish_the_connection'));
          this.initiateAutomaticReconnect();
          break;
        default:
          console.log('in onClose case: default')
          this.snackbarService.showError(this.translateService.instant('Socket.Error.You_Have_been_disconnected'));
          this.initiateAutomaticReconnect();
      }
    } else {
      if (event.code !== 1000) {
        console.log(`in onClose event code: ${event.code}`)
        this.snackbarService.showError(this.translateService.instant('Socket.Error.You_Have_been_disconnected'));
        console.log(event);
      }
      // this.connectionStatus = EConnectionStatus.Disconnected;
    }
    this.webSocket = null;
  }

  private onMessage(event: MessageEvent<string>): void {
    console.log(event.data);
    const message: ServerMessage = JSON.parse(event.data);
    this.handleServerMessage(message)
    this.incomingMessage.next(message);
  }

  private onError(_event: Event): void {
    if (this.status !== ESessionStatus.Resuming && this.status != ESessionStatus.Starting) {
      console.log(`in onError not connecting and not reconnecting : ${this.status}`);
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
}
