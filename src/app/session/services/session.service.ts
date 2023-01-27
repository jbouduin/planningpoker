import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent, ConfirmationDialogParams, ConnectionService,  LocalStorageService} from '@shared';
import {
  ClientMessage,  EServerMessageType,    IInitMessage, ServerMessage
} from '@shared-lib';
import { filter } from 'rxjs/operators';
import {
  CreateMessage, JoinMessage,
  LeaveMessage, RejoinMessage
} from '../messages';

import { CardService } from './card.service';
import { ErrorHandlerService } from './error-handler.service';
import { PokerService } from './poker.service';
import { TeamService } from './team.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  //#region private readonly properties ---------------------------------------
  private readonly cardService: CardService;
  private readonly connectionService: ConnectionService;
  private readonly dialog: MatDialog;
  private readonly errorHandlerService: ErrorHandlerService;
  private readonly localStorageService: LocalStorageService;
  private readonly teamService: TeamService;
  private readonly translateService: TranslateService;
  private readonly pokerService: PokerService;
  private readonly router: Router;
  //#endregion

  //#region private properties ------------------------------------------------
  private currentRoute: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    cardService: CardService,
    connectionService: ConnectionService,
    dialog: MatDialog,
    localStorageService: LocalStorageService,
    pokerService: PokerService,
    router: Router,
    errorHandlerService: ErrorHandlerService,
    teamService: TeamService,
    translateService: TranslateService) {

    this.cardService = cardService;
    this.connectionService = connectionService;
    this.dialog = dialog;
    this.localStorageService = localStorageService;
    this.pokerService = pokerService;
    this.errorHandlerService = errorHandlerService;
    this.router = router;
    this.teamService = teamService;
    this.translateService = translateService;
    this.currentRoute = '/';
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd)) // eslint-disable-line
      .subscribe(event => this.currentRoute = event.urlAfterRedirect);
  }
  //#endregion

  //#region public connection related methods ---------------------------------
  public create(team: string, nick: string, observer: boolean): void {
    console.log(`creating: ${nick}@${team}`);
    const message = new CreateMessage(
      '', {
      team: team,
      observer: observer || false,
      nick: nick
    });
    this.startSession(team, message);
  }

  public join(team: string, nick: string, observer: boolean): void {
    console.log(`joining: ${nick}@${team}`);
    const message = new JoinMessage(
      '',
      {
        team: team,
        observer: observer,
        nick: nick
      }
    );
    this.startSession(team, message);
  }

  // TODO this one is still called from home.component
  public rejoin(): void {
    // console.log(`rejoining  ${this.game.team} as ${this.game.myNick}`);
    // const message = new RejoinMessage('', this.game.myUuid);
    // this.startSession(this.game.team, message);
  }
  //#endregion

  // TODO this one is called from home component, should be solved differently
  public leave(): void {
    // const message = new LeaveMessage(this.game.myUuid);
    // this.connectionService.sendMessage(message);
    // // if we are connected, we are just leaving the game
    // // if not we are leaving a game we have been disconnected from before
    // if (this.connectionService.connectionStatus == EConnectionStatus.Connected) {
    //   this.connectionService.sendMessage(message);
    // } else {
    //   this.startSession(this.game.team, message);
    // }
    // this.reset();
  }

  public reset() {
    // TODO this one is still called from home
    this.connectionService.disconnect();
    // TODO reset all the services this.game.reset();
    if (this.currentRoute !== '/home') {
      console.log('navigating to home');
      this.router.navigate(['home']);
    }
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private serverMessageHandler(msg: ServerMessage): void {
    if (msg.type === EServerMessageType.Error) {
      if (this.errorHandlerService.handleErrorMessage(msg)) {
        this.reset();
      }
    } else if (msg.type === EServerMessageType.Reset) {
      this.handleServerReset();
    } else {
      this.cardService.handleServerMessage(msg);
      this.pokerService.handleServerMessage(msg);
      this.teamService.handleServerMessage(msg);

      switch (msg.type) {
        case EServerMessageType.EndSession: {
          this.handleEndSession();
          break;
        }
        case EServerMessageType.Init:
          if (this.currentRoute !== '/game') {
            console.log('navigating to game');
            this.router.navigate(['game']);
          }
          this.localStorageService.uuid = (<IInitMessage>msg).data.uuid;
          break;
        case EServerMessageType.Self:
          this.localStorageService.nick = (<IInitMessage>msg).data.nick;
          break;
      }
    }
  }

  private startSession(team: string, message: ClientMessage) {
    this.connectionService.connect(
      team,
      message,
      this.serverMessageHandler.bind(this));
  }

  private handleEndSession(): void {
    const params = new ConfirmationDialogParams();
    params.showCancelButton = false;
    params.title = this.translateService.instant('Dialog.Title.Session_ended');
    params.text = this.translateService.instant('Dialog.Text.The_scrummaster_has_ended_the_session');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: params
    });

    dialogRef.afterClosed().subscribe(_result => this.reset());
  }

  private handleServerReset(): void {
    const params = new ConfirmationDialogParams();
    params.showCancelButton = false;
    params.title = this.translateService.instant('Dialog.Title.Server_reset');
    params.text = this.translateService.instant('Dialog.Text.The_server_has_been_reset.');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: params
    });

    dialogRef.afterClosed().subscribe(_result => this.reset());
  }
  //#endregion
}
