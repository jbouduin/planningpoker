import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { DtoCreate } from '@shared-lib';
import { Reason } from '@shared-lib';
import { Message, MessageType } from '@shared-lib';

import { ConnectionService } from '@core';
import { ConfirmationDialogComponent, ConfirmationDialogParams, SnackbarService } from '@shared';

import { IGame } from './objects';
import { GameFactoryService } from './objects';
import { HttpClient, HttpResponse } from '@angular/common/http';

class CallBackParameter {
  public observer: boolean | undefined;
  public team: string | undefined;
  public nick: string | undefined;
  public oldUuid: string | undefined;

  public constructor(public uuid: string) {
    this.observer = false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

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
  private socket?: Subject<Message>;
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
      [this.setNick.bind(this), this.createTeam.bind(this)]
    );
  }

  public join(team: string, nick: string, observer: boolean): void {
    console.log(`joining: ${nick}@${team}`);
    this.createConnection(
      team,
      nick,
      observer,
      undefined,
      [this.setNick.bind(this), this.joinTeam.bind(this)]
    );
  }

  public rejoin(): void {
    console.log(`rejoining: ${this.game.myNick}@${this.game.team}`);
    this.createConnection(
      this.game.team,
      undefined,
      undefined,
      this.game.myUuid,
      [this.switchUuid.bind(this)]
    );
  }
  //#endregion

  //#region Public MessageType-related methods --------------------------------
  public estimate(index: number): void {
    console.log(`estimated ${index}`);
    if (this.socket) {
      const message: Message = {
        type: MessageType.Estimate,
        uuid: this.game.myUuid,
        data: index,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  public leave(): void {
    const message: Message = {
      type: MessageType.Leave,
      uuid: this.game.myUuid,
      data: '',
      reason: Reason.Refresh
    };
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
      const message: Message = {
        type: MessageType.Reveal,
        uuid: this.game.myUuid,
        data: this.game.team,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  public start(): void {
    console.log('starting');
    if (this.socket) {
      const message: Message = {
        type: MessageType.Start,
        uuid: this.game.myUuid,
        data: this.game.team,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  public withdraw(): void {
    console.log('withdraw estimation');
    if (this.socket) {
      const message: Message = {
        type: MessageType.Estimate,
        uuid: this.game.myUuid,
        data: -1,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }
  //#endregion

  //#region Public method to disconnect: Development only!!! ------------------
  public disconnect() {
    console.log('asking the server to kill my connection');
    if (this.socket) {
      const message: Message = {
        type: MessageType.KillMe,
        uuid: this.game.myUuid,
        data: '',
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }
  //#endregion

  //#region Private connection related methods --------------------------------
  private createConnection(
    team: string,
    nick: string | undefined,
    observer: boolean | undefined,
    oldUuid: string | undefined,
    callbacks: Array<(params: CallBackParameter) => void>) {
    this.socket = this.createSocket(team);

    this.socket.subscribe(msg => {
      switch (msg.type) {
        case MessageType.Cards: {
          this.game.setCards(msg.data);
          break;
        }
        case MessageType.ClearEstimations: {
          this.game.clearEstimations();
          break;
        }
        case MessageType.EndOfGame: {
          this.handleEndOfGame();
          break;
        }
        case MessageType.Error: {
          if (this.game.handleErrorMessage(msg.data.code)) {
            this.reset();
          }
          break;
        }
        case MessageType.Estimation: {
          this.game.handleEstimations(msg.data);
          break;
        }
        case MessageType.Game: {
          this.game.update(msg.data);
          // if we are not in there yet, this is the moment
          if (this.currentRoute !== '/game') {
            console.log('navigating to game');
            this.router.navigate(['game']);
          }
          break;
        }
        case MessageType.Self: {
          // if this is the very first response from the server, execute the callbacks
          // this will occur only once
          if (msg.reason === Reason.Init) {
            const callBackParams = new CallBackParameter(msg.data[0].uuid);
            callBackParams.team = team;
            callBackParams.nick = nick;
            callBackParams.observer = observer;
            callBackParams.oldUuid = oldUuid;
            callbacks.forEach(callback => callback(callBackParams));
          }
          this.game.handleSelf(msg.data[0]);
          break;
        }
        case MessageType.State: {
          this.game.update(msg.data.game);
          this.game.setCards(msg.data.cards);
          this.game.handleSelf(msg.data.self[0]);
          this.game.handleParticipants(msg.data.others, Reason.Refresh);
          this.game.handleEstimations(msg.data.estimations);
          if (this.currentRoute !== '/game') {
            console.log('navigating to game');
            this.router.navigate(['game']);
          }
          break;
        }
        case MessageType.Participant: {
          this.game.handleParticipants(msg.data, msg.reason);
          break;
        }
        case MessageType.Ping: {
          this.logPingMessage(msg)
          break;
        }
        case MessageType.Reset: {
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

  private createSocket(team: string): Subject<Message> {

    console.log(`in createsocket: ${team}`);
    return this.connectionService
      .connect(`ws://localhost:3001/game/${encodeURI(team)}`)
      .pipe(map((response: MessageEvent): Message => {
        console.log(response.data);
        const message: Message = JSON.parse(response.data);
        return message;
      })) as Subject<Message>;
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

    const createData: DtoCreate = {
      team: params.team || '',
      observer: params.observer || false
    };

    if (this.socket) {
      const message: Message = {
        type: MessageType.Create,
        uuid: params.uuid,
        data: createData,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  private joinTeam(params: CallBackParameter) {
    console.log('call joinTeam:', params);

    const joinData: DtoCreate = {
      team: params.team || '',
      observer: params.observer || false
    };

    if (this.socket) {
      const message: Message = {
        type: MessageType.Join,
        uuid: params.uuid,
        data: joinData,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  private switchUuid(params: CallBackParameter) {
    console.log('call switchUuid:', params);
    if (this.socket) {
      const message: Message = {
        type: MessageType.Switch,
        uuid: params.uuid,
        data: params.oldUuid,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  private setNick(params: CallBackParameter) {
    console.log('call setNick:', params);
    if (this.socket) {
      const message: Message = {
        type: MessageType.Nick,
        uuid: params.uuid,
        data: params.nick,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }
  //#endregion

  //#region Private logger methods for incoming messages ----------------------

  private logPingMessage(message: Message) {
    console.log({
      reason: Reason[message.reason],
      type: MessageType[message.type],
      data: message.data
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
    params.title = this.translateService.instant('Dialog.Title.Game_Ended');
    params.text = this.translateService.instant('Dialog.Text.The_scrummaster_has_ended_the_game.');

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
