import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ConnectionService, EConnectionStatus } from '@shared';
import { ClientMessage, ECardSet, EServerMessageType, ICardSet, ServerMessage } from '@shared-lib';
import { filter } from 'rxjs/operators';
import { CreateMessage, JoinMessage, LeaveMessage, RejoinMessage } from '@shared/messages';

import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  //#region private readonly properties ---------------------------------------
  // private readonly cardService: CardService;
  private readonly connectionService: ConnectionService;
  private readonly errorHandlerService: ErrorHandlerService;
  private readonly router: Router;
  //#endregion

  //#region private properties ------------------------------------------------
  private currentRoute: string;
  //#endregion

  //#region public properties -------------------------------------------------
  public inSession: boolean;
  //#endregion

  // TODO 2359 because the session service is injected in homecomponent, everything injected here is also in main
  // make message handler register themselves in the connection service or something similar
  //#region Constructor & C° --------------------------------------------------
  public constructor(
    connectionService: ConnectionService,
    router: Router,
    errorHandlerService: ErrorHandlerService) {
    this.connectionService = connectionService;
    this.errorHandlerService = errorHandlerService;
    this.router = router;
    this.currentRoute = '/';
    this.inSession = false;
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd)) // eslint-disable-line
      .subscribe(event => this.currentRoute = event.urlAfterRedirect);
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
    const message = new CreateMessage(
      '',
      {
        team: team,
        observer: observer || false,
        nick: nick,
        cardSet: cardSet,
        cards: cards
      }
    );
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
    const message = new LeaveMessage(myUuid, myUuid);

    // if we are connected, we are just leaving the game
    // if not we are leaving a game we have been disconnected from before
    if (this.connectionService.connectionStatus == EConnectionStatus.Connected) {
      this.connectionService.sendMessage(message);
    } else {
      this.startSession(team, message);
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
      case EServerMessageType.Left:
      case EServerMessageType.ServerReset:
      case EServerMessageType.TeamIdle:
        this.resetMe();
        break;
      case EServerMessageType.Init:
        this.inSession = true;
        this.navigateTo('/game');
    }
  }

  private startSession(team: string, message: ClientMessage) {
    this.connectionService.connect(
      team,
      message,
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
