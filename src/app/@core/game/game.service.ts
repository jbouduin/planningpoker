import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as Collections from 'typescript-collections';

import { DtoParticipant, GameStatus, ParticipantStatus, Reason, Role } from '../../../../projects/shared-lib/lib';
import { ErrorCode, Message, MessageType, Verb } from '../../../../projects/shared-lib/lib';
import { ToastService } from '../../toast'
import { WebsocketService } from '../websocket.service';

import { Card } from './card';
import { Game } from './game';
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
  private readonly game: Game;
  private readonly localStorageNickKey: string = 'current_nick';
  private readonly localStorageUuidKey: string = 'current_uuid';
  private readonly localStorageTeamKey: string = 'current_team';
  // </editor-fold>

  // <editor-fold desc='private properties'>
  private currentRoute: string;
  // TODO (#696) move self and participants to game
  private self?: Participant;
  private participants: Collections.Dictionary<string, Participant>;
  private socket?: Subject<Message>;
  // </editor-fold>

  // <editor-fold desc='constructor & C°'>
  public constructor(
    private router: Router,
    private toastService: ToastService,
    private websocketService: WebsocketService) {
    console.log('in Gameservice constructor');
    this.currentRoute = '/';
    this.game = Game.createGame(
      localStorage.getItem(this.localStorageTeamKey) || '',
      localStorage.getItem(this.localStorageTeamKey) && localStorage.getItem(this.localStorageUuidKey) ?
        GameStatus.Disconnected : GameStatus.NoGame
    );
    this.participants = new Collections.Dictionary<string, Participant>();
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(event => this.currentRoute = event.urlAfterRedirect );
  }
  // </editor-fold>

  // <editor-fold desc='getter methods'>
  public get canReconnect(): boolean {
    return this.game.status === GameStatus.Disconnected;
  }

  public get cards() : Array<Card> {
    return this.game.availableCards;
  }

  public get developers(): Array<Participant> {
    const result = new Array<Participant>();
    if (this.self?.role === Role.Developer) {
      result.push(this.self);
    }
    return result.concat(
      this.participants.values().filter(participant => participant.role === Role.Developer)
    );
  }

  public get estimations(): Array<Estimation> {
    return this.game.estimations;
  }

  public get myNick(): string {
    return this.self ?
      this.self.nick :
      localStorage.getItem(this.localStorageNickKey) || '';
  }

  public get myRole(): Role {
    return this.self ? this.self.role : Role.Unknown;
  }

  public get myUuid(): string {
    return this.self ?
      this.self.uuid :
      localStorage.getItem(this.localStorageUuidKey) || '';
  }

  public get scrumMaster(): Participant | undefined {
    if (this.self?.role === Role.ScrumMaster) {
      return this.self;
    }
    const result = this.participants.values()
      .filter(participant => participant.role === Role.ScrumMaster)[0];
    return result ? result : undefined;
  }

  public get status(): GameStatus {
    return this.game.status;
  }

  public get team(): string {
    return this.game.team;
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
    console.log(`rejoining: ${this.myNick}@${this.team}`);
    this.createConnection(
      this.team,
      undefined,
      localStorage.getItem(this.localStorageUuidKey) || undefined,
      [ this.switchUuid.bind(this) ]
    );
  }
  // </editor-fold>

  // <editor-fold desc='Public verb related methods'>
  public estimate(index: number): void {
    console.log(`estimated ${index}`);
    if (this.socket) {
      const message: Message = {
        type: Verb.Estimate,
        uuid: this.myUuid,
        data: index,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  public leave(): void {
    const message: Message = {
      type: Verb.Leave,
      uuid: this.myUuid,
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
      console.log(`creating a connection to leave ${this.team}`);
      const socket = this.createSocket(this.team);
      socket.subscribe(
        msg => {
          socket.next(message);
          this.reset();
        },
        err => this.toastService.show({
          text: `Error code: ${err}`,
          type: 'warning'
        })
      );
    }
  }

  public reveal(): void {
    console.log('reveal');
    if (this.socket) {
      const message: Message = {
        type: Verb.Reveal,
        uuid: this.myUuid,
        data: this.team,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  public start(): void {
    console.log('starting');
    if (this.socket) {
      const message: Message = {
        type: Verb.Start,
        uuid: this.myUuid,
        data: this.team,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }

  public withdraw(): void {
    console.log('withdraw estimation');
    if (this.socket) {
      const message: Message = {
        type: Verb.Estimate,
        uuid: this.myUuid,
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
          this.logCardsMessage(msg);
          this.game.setCards(msg.data);
          break;
        }
        case MessageType.ClearEstimations: {
          this.game.clearEstimations();
          break;
        }
        case MessageType.Error: {
          this.logErrorMessage(msg);
          this.toastService.show({
            text: `Error code: ${msg.data.code}`,
            type: 'warning'
          });

          if (msg.data.code === ErrorCode.TeamAlreadyExists ||
            msg.data.code === ErrorCode.TeamDoesNotExist ||
            msg.data.code === ErrorCode.ParticipantNotFound) {
            this.reset();
          }
          break;
        }
        case MessageType.Estimation: {
          this.logEstimationMessage(msg);
          console.log('upserting estimation');
          this.game.handleEstimations(msg.data, this.participants, this.self);
          break;
        }
        case MessageType.Game: {
          this.logGameMessage(msg);
          // if we are not in there yet, this is the moment
          if (this.currentRoute !== '/game') {
            console.log('navigating to game');
            this.router.navigate(['game']);
          }
          this.game.update(msg.data);
          localStorage.setItem(this.localStorageTeamKey, team);
          break;
        }
        case MessageType.Self: {
          this.logParticipantMessage(msg);
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
          this.self = Participant.createParticipant(msg.data[0], true);
          localStorage.setItem(this.localStorageNickKey, this.self.nick);
          localStorage.setItem(this.localStorageUuidKey, this.self.uuid);
          break;
        }
        case MessageType.Participant: {
          this.logParticipantMessage(msg);
          msg.data.forEach( (dtoParticipant: DtoParticipant) => {
            const participant: Participant = Participant.createParticipant(dtoParticipant, false);
            if (participant.status === ParticipantStatus.Left)
            {
              this.toastService.show({
                text: `'${participant.nick}' has left.`,
                type: 'info'
              });
              this.participants.remove(participant.uuid);
            } else {
              if (msg.reason !== Reason.Init && !this.participants.getValue(participant.uuid)) {
                this.toastService.show({
                  text: `'${participant.nick}' joined.`,
                  type: 'info'
                });
              }
              this.participants.setValue(participant.uuid, participant);
            }
          });
          break;
        }
        case MessageType.Ping: {
          this.logPingMessage(msg)
          break;
        }
        default: {
          console.log(`MessageType ?: ${msg}`);
          this.toastService.show({
            text: `Received unknown message type from server: '${msg.type}'.`,
            type: 'info'
          });
        }
      }
    },
    err => this.toastService.show({
      text: `Error code: ${err}`,
      type: 'warning'
    }),
    () => {
      if (this.currentRoute === '/game') {
        this.toastService.show({
          text: 'You have been disconnected',
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
    this.self = undefined;
    localStorage.removeItem(this.localStorageNickKey);
    localStorage.removeItem(this.localStorageUuidKey);
    localStorage.removeItem(this.localStorageTeamKey);

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
        type: Verb.Create,
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
        type: Verb.Join,
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
        type: Verb.Switch,
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
        type: Verb.Nick,
        uuid: params.uuid,
        data: params.nick,
        reason: Reason.Refresh
      };
      this.socket.next(message);
    }
  }
  // </editor-fold>

  // <editor-fold desc='private logger methods for incoming messages'>
  private logCardsMessage(message: Message) {
    const cards = message.data.map( (card:any) => {
      return {
        index: card.index,
        label: card.label
      };
    });

    console.log({
      reason: Reason[message.reason],
      type: MessageType[message.type],
      cards
    });
  }

  private logErrorMessage(message: Message) {
    console.log({
      _reason: Reason[message.reason],
      _type: MessageType[message.type],
      code: ErrorCode[message.data.code],
      error: message.data.message
    });
  }

  private logEstimationMessage(message: Message) {
    const estimations = message.data.map( (estimation: any) => {
      return {
        card: estimation.card,
        revealed: estimation.revealed,
        uuid: estimation.uuid
      };
    });

    console.log({
      reason: Reason[message.reason],
      type: MessageType[message.type],
      estimations
    });
  }

  private logGameMessage(message: Message) {
    console.log({
      reason: Reason[message.reason],
      type: MessageType[message.type],
      team: message.data.team,
      status: GameStatus[message.data.status]
    });
  }

  private logParticipantMessage(message: Message) {
    const data = message.data.forEach( (item: any) => {
      return {
        status: ParticipantStatus[item.status],
        nick: item.nick,
        uuid: item.uuid,
        role: Role[item.role]
      };
    });

    console.log({
      reason: Reason[message.reason],
      type: MessageType[message.type],
      data
    });
  }

  private logPingMessage(message: Message) {
    console.log({
      reason: Reason[message.reason],
      type: MessageType[message.type],
      data: message.data
    });
  }
  // </editor-fold>
}
