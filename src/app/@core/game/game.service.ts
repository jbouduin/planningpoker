import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as Collections from 'typescript-collections';

import { DtoParticipant, GameStatus, ParticipantStatus, Reason, Role } from '../../../../projects/shared-lib/lib';
import { ErrorCode, Message, MessageType } from '../../../../projects/shared-lib/lib';
import { ToastService } from '../../toast';
import { WebsocketService } from '../websocket.service';

import { Card } from './card';
import { Game } from './game';
import { GameFactoryService } from './game-factory.service';
import { Estimation } from './estimation';
import { Participant } from './participant';

interface CallBackParameter {
  uuid: string,
  team?: string,
  nick?: string,
  oldUuid?: string
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // <editor-fold desc='private readonly properties'>
  private readonly theGame: Game;
  // </editor-fold>

  // <editor-fold desc='private properties'>
  private currentRoute: string;
  private socket?: Subject<Message>;
  // </editor-fold>

  // <editor-fold desc='constructor & C°'>
  public constructor(
    private translateService: TranslateService,
    private router: Router,
    private toastService: ToastService,
    private websocketService: WebsocketService,
    factoryService: GameFactoryService) {
    console.log('in Gameservice constructor');
    this.currentRoute = '/';
    this.theGame = factoryService.Game();
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(event => this.currentRoute = event.urlAfterRedirect );
  }
  // </editor-fold>

  // <editor-fold desc='getter methods'>
  public get game(): Game {
    return this.theGame;
  }
  // </editor-fold>

  // <editor-fold desc='public connection related methods'>
  public create(team: string, nick: string): void {
    console.log(`creating: ${nick}@${team}`);
    this.createConnection(
      team,
      nick,
      undefined,
      [ this.setNick.bind(this),  this.createTeam.bind(this) ]
    );
  }

  public join(team: string, nick: string): void {
    console.log(`joining: ${nick}@${team}`);
    this.createConnection(
      team,
      nick,
      undefined,
      [ this.setNick.bind(this), this.joinTeam.bind(this) ]
    );
  }

  public rejoin(): void {
    console.log(`rejoining: ${this.game.myNick}@${this.game.team}`);
    this.createConnection(
      this.game.team,
      undefined,
      this.game.myUuid,
      [ this.switchUuid.bind(this) ]
    );
  }
  // </editor-fold>

  // <editor-fold desc='Public MessageType-related methods'>
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
        msg => {
          socket.next(message);
          this.reset();
        },
        err => {
          console.log(err);
          this.toastService.show({
            text: this.translateService.instant('Socket error'),
            type: 'warning'
          });
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
  // </editor-fold>

  // <editor-fold desc='private connection related methods'>
  private createConnection(
    team: string,
    nick: string | undefined,
    oldUuid: string | undefined,
    callbacks: Array<(params: CallBackParameter) => void>) {
    this.socket = this.createSocket(team);

    this.socket.subscribe(msg => {

      switch(msg.type) {
        case MessageType.Cards: {
          this.game.setCards(msg.data);
          break;
        }
        case MessageType.ClearEstimations: {
          this.game.clearEstimations();
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
            const callBackParams: CallBackParameter = {
              uuid: msg.data[0].uuid,
              team,
              nick,
              oldUuid
            }
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
        default: {
          console.log(`MessageType ?: ${msg}`);
          this.toastService.show({
            text: this.translateService.instant('UnknownMessageType'),
            type: 'info'
          });
        }
      }
    },
    err => {
      console.log(err);
      this.toastService.show({
        text: this.translateService.instant('Socket error'),
        type: 'warning'
      });
    },
    () => {
      if (this.currentRoute === '/game') {
        this.toastService.show({
          text: this.translateService.instant('You have been disconnected'),
          type: 'warning'
        });
      }
    });
  }

  private createSocket(team: string): Subject<Message> {
    console.log(`in createsocket: ${team}`);
    return this.websocketService
			.connect(`ws://localhost:3001/game/${encodeURI(team)}`)
			.pipe(map((response: MessageEvent): Message => {
        console.log(response.data);
				const message: Message = JSON.parse(response.data);
        return message;
			})) as Subject<Message>;
  }

  private reset() {
    if (this.socket) {
      this.socket.unsubscribe();
    }
    this.websocketService.disconnect();
    this.game.reset();
    if (this.currentRoute !== '/home') {
      console.log('navigating to home');
      this.router.navigate(['home']);
    }
  }
  // </editor-fold>

  // <editor-fold desc='Private Init-Callback methods'>

  private createTeam(params: CallBackParameter) {
    console.log(`call createTeam: ${params}`);

    if (this.socket) {
      const message: Message = {
        type: MessageType.Create,
        uuid: params.uuid,
        data: params.team,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  private joinTeam(params: CallBackParameter) {
    console.log(`call joinTeam: ${params}`);
    if (this.socket) {
      const message: Message = {
        type: MessageType.Join,
        uuid: params.uuid,
        data: params.team,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  private switchUuid (params: CallBackParameter) {
    console.log(`call switchUuid: ${params}`);
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
    console.log(`call setNick: ${params}`);
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
  // </editor-fold>

  // <editor-fold desc='private logger methods for incoming messages'>

  private logPingMessage(message: Message) {
    console.log({
      reason: Reason[message.reason],
      type: MessageType[message.type],
      data: message.data
    });
  }
  // </editor-fold>
}
