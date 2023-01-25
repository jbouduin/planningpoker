import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';

import { ConnectionService } from '@core';
import { ConfirmationDialogComponent, ConfirmationDialogParams, SnackbarService } from '@shared';

import { HttpClient, HttpResponse } from '@angular/common/http';
import {
  ClientMessage, ICreate, IJoin, ICardSetMessage, IErrorMessage, IEstimationsMessage,
  IInitMessage, ISelfMessage, IGameStatusMessage, ITeamInfoMessage, EServerMessageType, ServerMessage, IMemberChangedMessage
} from '@shared-lib';
import {
  CreateMessage, DisconnectMessage, EstimateMessage, JoinMessage,
  LeaveMessage, RejoinMessage, RevealMessage, StartMessage
} from './messages';
import { GameFactoryService, IGame } from './objects';

class CallBackParameter {
  public observer: boolean | undefined;
  public team: string;
  public nick: string;
  public oldUuid: string;

  public constructor(public uuid: string) {
    this.observer = false;
    this.team = "";
    this.nick = "";
    this.oldUuid = "";
  }
}

type AMessage = ServerMessage | ClientMessage;
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  //#region private readonly properties ---------------------------------------
  private readonly dialog: MatDialog;
  private readonly translateService: TranslateService;
  private readonly router: Router;
  private readonly snackbarService: SnackbarService;
  private readonly connectionService: ConnectionService;
  private readonly http: HttpClient;
  //#endregion

  //#region private properties ------------------------------------------------
  private currentRoute: string;
  private socket?: Subject<AMessage>;
  //#endregion

  //#region public properties -------------------------------------------------
  public readonly game: IGame;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialog: MatDialog,
    translateService: TranslateService,
    router: Router,
    snackbarService: SnackbarService,
    connectionService: ConnectionService,
    http: HttpClient,
    factoryService: GameFactoryService) {
    console.log('in Gameservice constructor');
    this.dialog = dialog;
    this.translateService = translateService;
    this.router = router;
    this.snackbarService = snackbarService;
    this.connectionService = connectionService;
    this.http = http;
    this.currentRoute = '/';
    this.game = factoryService.Game();

    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd)) // eslint-disable-line
      .subscribe(event => this.currentRoute = event.urlAfterRedirect);
  }
  //#endregion

  //#region public connection related methods ---------------------------------
  public checkTeamExists(): Observable<boolean> {
    return this.http
      .get(`/api/team/${this.game.team}`, { observe: 'response', responseType: 'text' })
      .pipe(
        catchError((error: HttpResponse<unknown>) => of(error)),
        map((response: HttpResponse<unknown>) => {
          return response.status == 200 ? true : false
        })
      );
  }

  public create(team: string, nick: string, observer: boolean): void {
    console.log(`creating: ${nick}@${team}`);
    this.createConnection(
      team,
      nick,
      observer,
      undefined,
      [this.createTeam.bind(this)]
    );
  }

  public join(team: string, nick: string, observer: boolean): void {
    console.log(`joining: ${nick}@${team}`);
    this.createConnection(
      team,
      nick,
      observer,
      undefined,
      [this.joinTeam.bind(this)]
    );
  }

  public rejoin(): void {
    console.log(`rejoining: ${this.game.myNick}@${this.game.team}`);
    this.createConnection(
      this.game.team,
      '',
      undefined,
      this.game.myUuid,
      [this.rejoinTeam.bind(this)]
    );
  }
  //#endregion

  //#region Public MessageType-related methods --------------------------------
  public estimate(index: number): void {
    console.log(`estimated ${index}`);
    if (this.socket) {
      const message = new EstimateMessage(this.game.myUuid, index);
      this.socket.next(message);
    }
  }

  public leave(): void {
    const message = new LeaveMessage(this.game.myUuid);
    // if we are connected, we are just leaving the game
    // if not we are leaving a game we have been disconnected from before
    if (this.socket) {
      console.log('leaving with existing connection');
      this.socket.next(message);
      this.reset();
    } else {
      console.log(`creating a connection to leave ${this.game.team}`);
      const socket = this.createSocket(this.game.team);
      // at least one consumer has to subscribe to the created subject
      // otherwise "nexted" values will be just buffered and not sent, since no connection was established!
      socket.subscribe(
        _msg => {
          socket.next(message);
          this.reset();
        },
        error => {
          console.log(error);
          this.game.handleSocketError(error);
        }
      );
    }
  }

  public reveal(): void {
    console.log('reveal');
    if (this.socket) {
      const message = new RevealMessage(this.game.myUuid, this.game.team);
      this.socket.next(message);
    }
  }

  public start(): void {
    console.log('starting');
    if (this.socket) {
      const message = new StartMessage(this.game.myUuid, this.game.team);
      this.socket.next(message);
    }
  }

  public withdraw(): void {
    console.log('withdraw estimation');
    if (this.socket) {
      const message = new EstimateMessage(this.game.myUuid, -1);
      this.socket.next(message);
    }
  }
  //#endregion

  //#region Public method to disconnect: Development only!!! ------------------
  public disconnect() {
    console.log('asking the server to kill my connection');
    if (this.socket) {
      const message = new DisconnectMessage(this.game.myUuid);
      this.socket.next(message);
    }
  }
  //#endregion

  //#region Private connection related methods --------------------------------
  private createConnection(
    team: string,
    nick: string,
    observer: boolean | undefined,
    oldUuid: string | undefined,
    callbacks: Array<(params: CallBackParameter) => void>) {
    this.socket = this.createSocket(team);

    this.socket.subscribe((msg: AMessage) => {
      switch (msg.type) {
        case EServerMessageType.CardList: {
          this.game.setCards((<ICardSetMessage>msg).data);
          break;
        }
        case EServerMessageType.ClearEstimations: {
          this.game.clearEstimations();
          break;
        }
        case EServerMessageType.EndSession: {
          this.handleEndOfGame();
          break;
        }
        case EServerMessageType.Error: {
          if (this.game.handleErrorMessage((<IErrorMessage>msg).data.code)) {
            this.reset();
          }
          break;
        }
        case EServerMessageType.EstimationList: {
          this.game.handleEstimations((<IEstimationsMessage>msg).data);
          break;
        }
        case EServerMessageType.Init: {
          const data = (<IInitMessage>msg).data;
          const callBackParams = new CallBackParameter(data.uuid);
          callBackParams.team = team;
          callBackParams.nick = nick;
          callBackParams.observer = observer;
          callBackParams.oldUuid = oldUuid || '';
          callbacks.forEach(callback => callback(callBackParams));
          this.game.handleSelf(data);
          break;
        }
        case EServerMessageType.GameStatus: {
          this.game.updateGameStatus((<IGameStatusMessage>msg).data);
          // if we are not in there yet, this is the moment
          if (this.currentRoute !== '/game') {
            console.log('navigating to game');
            this.router.navigate(['game']);
          }
          break;
        }
        case EServerMessageType.Self: {
          this.game.handleSelf((<ISelfMessage>msg).data);
          break;
        }
        case EServerMessageType.TeamInfo: {
          const data = (<ITeamInfoMessage>msg).data;
          this.game.updateTeamName(data.teamName);
          this.game.updateGameStatus(data.gameStatus);
          this.game.setCards(data.cards);
          this.game.handleSelf(data.self);
          this.game.handleMemberList(data.otherMembers);
          this.game.handleEstimations(data.estimations);
          if (this.currentRoute !== '/game') {
            console.log('navigating to game');
            this.router.navigate(['game']);
          }
          break;
        }
        case EServerMessageType.MemberChanged: {
           this.game.handleMemberChanged((<IMemberChangedMessage>msg).data);
           break;
        }
        case EServerMessageType.Ping: {
          this.logServerMessage(msg)
          break;
        }
        case EServerMessageType.Reset: {
          this.handleServerReset();
          break;
        }
        default: {
          console.log(`MessageType ?: ${msg}`);
          this.snackbarService.showWarning(
            this.translateService.instant('Error.UnknownMessageType_$type', { type: msg.type })
          );
        }
      }
    },
      error => {
        // we pass here if the connection drops or if the socket connection fails
        console.log('in error handle');
        console.log(error);
        //
        if (error.target && error.target.readyState && error.target.readyState === 3) {
          this.game.handleDisconnect();
          this.handleDisconnect();
        } else {
          this.game.handleSocketError(error);
        }
      },
      () => {
        // this happens when the client or the server close the socket
        // normally that happens only after 'leave'
        // so we normally do not have to do anything here
        // we have this special case in development, where we asked the server to kill me
        console.log('gracefull disconnect');
        if (this.socket) {
          this.game.handleDisconnect();
          this.handleDisconnect();
        }
      });
  }

  private createSocket(team: string): Subject<AMessage> {

    console.log(`in createsocket: ${team}`);
    return this.connectionService
      .connect(`ws://localhost:3001/game/${encodeURI(team)}`)
      .pipe(map((response: MessageEvent): AMessage => {
        console.log(response.data);
        const message: AMessage = JSON.parse(response.data);
        return message;
      })) as Subject<AMessage>;
  }

  public reset() {
    if (this.socket) {
      this.socket.unsubscribe();
      this.socket = undefined;
    }
    this.connectionService.disconnect();
    this.game.reset();
    if (this.currentRoute !== '/home') {
      console.log('navigating to home');
      this.router.navigate(['home']);
    }
  }
  //#endregion

  //#region Private Init-Callback methods -------------------------------------
  private createTeam(params: CallBackParameter) {
    console.log('call createTeam:', params);
    const createData: ICreate = {
      team: params.team,
      observer: params.observer || false,
      nick: params.nick
    };

    if (this.socket) {
      const message = new CreateMessage(params.uuid, createData);
      this.socket.next(message);
    }
  }

  private joinTeam(params: CallBackParameter) {
    console.log('call joinTeam:', params);

    const joinData: IJoin = {
      team: params.team || '',
      observer: params.observer || false,
      nick: params.nick
    };

    if (this.socket) {
      const message = new JoinMessage(params.uuid, joinData);
      this.socket.next(message);
    }
  }

  private rejoinTeam(params: CallBackParameter) {
    console.log('call switchUuid:', params);
    if (this.socket) {
      const message = new RejoinMessage(params.uuid, params.oldUuid);
      this.socket.next(message);
    }
  }

  // private setNick(params: CallBackParameter) {
  //   console.log('call setNick:', params);
  //   if (this.socket) {
  //     const message = new SetNickMessage(params.uuid, params.nick);
  //     this.socket.next(message);
  //   }
  // }
  //#endregion

  //#region Private logger methods for incoming messages ----------------------

  private logServerMessage(message: ServerMessage) {
    console.log({
      type: EServerMessageType[message.type],
      data: JSON.stringify(message.data, null, 2)
    });
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private handleDisconnect() {
    this.connectionService.handleDisconnect(this.rejoin.bind(this));
  }

  private handleEndOfGame(): void {
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
