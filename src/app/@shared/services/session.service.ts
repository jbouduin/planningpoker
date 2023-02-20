import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';

import { ClientMessage, ECardSet, EParticipantStatus, ERole, EServerMessageType, ICardSet, IInitMessage, ISelfMessage, ServerMessage } from '@shared-lib';

import { ConnectionService, EConnectionStatus, LocalStorageService, MessageBoxComponent, MessageBoxParams, SnackbarService } from '@shared';
import { CreateMessage, JoinMessage, LeaveMessage, RejoinMessage } from '../messages';
import { ErrorHandlerService } from './error-handler.service';
import { Member } from './member';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  //#region private readonly properties ---------------------------------------
  private readonly connectionService: ConnectionService;
  private readonly dialog: MatDialog;
  private readonly errorHandlerService: ErrorHandlerService;
  private readonly localStorage: LocalStorageService;
  private readonly router: Router;
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region private properties ------------------------------------------------
  private currentRoute: string;
  private initialMessage?: ClientMessage;
  private me: Member;
  //#endregion

  //#region public properties -------------------------------------------------
  public inSession: boolean;
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
    connectionService: ConnectionService,
    dialog: MatDialog,
    errorHandlerService: ErrorHandlerService,
    localStorage: LocalStorageService,
    router: Router,
    snackbarService: SnackbarService,
    translateService: TranslateService) {
    this.connectionService = connectionService;
    this.dialog = dialog;
    this.errorHandlerService = errorHandlerService;
    this.localStorage = localStorage;
    this.router = router;
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.currentRoute = '/';
    this.inSession = false;
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd)) // eslint-disable-line
      .subscribe(event => this.currentRoute = event.urlAfterRedirect);
    this.me = new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, uuid: '' }, true);
    this.connectionService.incomingMessage.subscribe((serverMessage: ServerMessage) => this.handleServerMessage(serverMessage));
    this.connectionService.reset.subscribe(() => this.resetMe());
  }
  //#endregion

  //#region public connection related methods ---------------------------------
  public create(
    team: string,
    nick: string,
    observer: boolean,
    cardSet: ECardSet,
    cards: ICardSet | undefined): void {
    console.log(`creating: ${nick}@${team}`);
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
    this.startSession(team);
  }

  public join(team: string, nick: string, observer: boolean): void {
    console.log(`joining: ${nick}@${team}`);
    this.initialMessage = new JoinMessage(
      '',
      {
        team: team,
        observer: observer,
        nick: nick
      }
    );
    this.startSession(team);
  }

  public rejoin(team: string, uuid: string): void {
    console.log(`rejoining  ${team} as ${uuid}`);
    this.initialMessage = new RejoinMessage('', uuid);
    this.startSession(team);
  }
  //#endregion

  // this one is called from home component
  public leave(team: string, myUuid: string): void {
    const message = new LeaveMessage(myUuid, myUuid);
    // if we are connected, we are just leaving the game
    // if not we are leaving a game we have been disconnected from before
    if (this.connectionService.connectionStatus == EConnectionStatus.Connected) {
      this.connectionService.sendMessage(message);
    } else {
      this.initialMessage = message;
      this.startSession(team);
    }
  }

  public giveUpReconnecting(): void {
    this.inSession = false;
    this.navigateTo('/home');
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Error:
        if (this.errorHandlerService.handleErrorMessage(message)) {
          this.resetMe();
        }
        break;
      case EServerMessageType.EndSession:
        this.handleEndSession();
        break;
      case EServerMessageType.Left:
        this.resetMe();
        break;
      case EServerMessageType.ServerReset:
        this.handleServerReset();
        break;
      case EServerMessageType.TeamIdle:
        this.handleTeamIdle();
        break;
      case EServerMessageType.Init:
        if (this.initialMessage) {
          this.initialMessage.senderUuid = (<IInitMessage>message).data.uuid;
          this.connectionService.sendMessage(this.initialMessage);
          this.initialMessage = undefined;
        }
        this.me = new Member((<IInitMessage>message).data, true);
        this.localStorage.uuid = this.me.uuid;
        this.inSession = true;
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
          this.connectionService.disconnect();
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
    this.resetMe();
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
    this.resetMe();
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
    this.resetMe();
  }

  private startSession(team: string) {
    this.connectionService.connect(
      team,
      this.rejoinCallBack.bind(this));
  }

  private resetMe() {
    this.inSession = false;
    this.connectionService.disconnect();
    this.navigateTo('/home');
  }

  private navigateTo(route: string): void {
    if (this.currentRoute !== route) {
      console.log(`navigating to '${route}'`);
      this.router.navigate([route]);
    }
  }

  private rejoinCallBack(): void {
    // TODO NOW this.rejoin(this.teamService.teamName, this.teamService.me.uuid);
  }
  //#endregion
}
