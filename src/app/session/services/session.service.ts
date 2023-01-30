import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ConnectionService, EConnectionStatus } from '@shared';
import { ClientMessage, EServerMessageType, ServerMessage } from '@shared-lib';
import { filter } from 'rxjs/operators';
import { CreateMessage, JoinMessage, LeaveMessage, RejoinMessage } from '../messages';

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
  private readonly errorHandlerService: ErrorHandlerService;
  private readonly teamService: TeamService;
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
    pokerService: PokerService,
    router: Router,
    errorHandlerService: ErrorHandlerService,
    teamService: TeamService) {

    this.cardService = cardService;
    this.connectionService = connectionService;
    this.pokerService = pokerService;
    this.errorHandlerService = errorHandlerService;
    this.router = router;
    this.teamService = teamService;
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

  public rejoin(team: string, uuid: string): void {
    console.log(`rejoining  ${team} as ${uuid}`);
    const message = new RejoinMessage('', uuid);
    this.startSession(team, message);
  }
  //#endregion

  // this one is called from home component
  public leave(team: string, myUuid: string): void {
    const message = new LeaveMessage(myUuid);

    // if we are connected, we are just leaving the game
    // if not we are leaving a game we have been disconnected from before
    if (this.connectionService.connectionStatus == EConnectionStatus.Connected) {
      this.connectionService.sendMessage(message);
    } else {
      this.startSession(team, message);
    }
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private serverMessageHandler(message: ServerMessage): void {
    this.cardService.handleServerMessage(message);
    this.pokerService.handleServerMessage(message);
    this.teamService.handleServerMessage(message);
    this.handleServerMessage(message);
  }

  private handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Error:
        if (this.errorHandlerService.handleErrorMessage(message)) {
          this.reset();
        }
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.Left:
      case EServerMessageType.Reset:
        this.reset();
        break;
      case EServerMessageType.Init:
        this.navigateTo('/game');
    }
  }

  private startSession(team: string, message: ClientMessage) {
    this.connectionService.connect(
      team,
      message,
      this.serverMessageHandler.bind(this),
      this.rejoinCallBack.bind(this));
  }

  private reset() {
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
    this.rejoin(this.teamService.teamName, this.teamService.me.uuid);
  }
  //#endregion
}
