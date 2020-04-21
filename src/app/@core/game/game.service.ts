import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as Collections from 'typescript-collections';

import { DtoCard, DtoGame, DtoParticipant } from '../../../../projects/shared-lib/lib';
import { ParticipantStatus, Reason, Role } from '../../../../projects/shared-lib/lib';
import { ErrorCode, Message, MessageType, Verb } from '../../../../projects/shared-lib/lib';
import { ToastService } from '../../toast'
import { WebsocketService } from '../websocket.service';

import { Game } from './game';
import { Participant } from './participant';

interface CallBackParameter {
  uuid: string,
  team?: string,
  nick?: string,
  oldUuid?: string
}

@Injectable({
  providedIn: 'root',
})
export class GameService {

  // <editor-fold desc='private readonly properties'>
  private readonly localStorageNickKey: string = "current_nick";
  private readonly localStorageUuidKey: string = "current_uuid";
  private readonly localStorageTeamKey: string = "current_team";
  // </editor-fold>

  // <editor-fold desc='private properties'>
  private currentRoute: string;
  private game?: Game;
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
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(event => this.currentRoute = event.urlAfterRedirect );
    this.currentRoute = '/';
    this.participants = new Collections.Dictionary<string, Participant>();
  }
  // </editor-fold>

  // <editor-fold desc='getter methods'>
  public get canReconnect(): boolean {
    if (localStorage.getItem(this.localStorageUuidKey) &&
      localStorage.getItem(this.localStorageTeamKey)) {
      return true;
    } else {
      return false;
    }
  }

  public get cards() : Array<DtoCard> {
    return this.game ? this.game.cards : new Array<DtoCard>();
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

  public get myNick(): string {
    return this.self ?
      this.self.nick :
      localStorage.getItem(this.localStorageNickKey) || '';
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

  public get team(): string {
    return this.game ?
      this.game.team :
      localStorage.getItem(this.localStorageTeamKey) || '';
  }
  // </editor-fold>

  // <editor-fold desc='public verb related methods'>
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
      if (this.team) {
        const socket = this.createSocket(this.team);
        socket.subscribe(
          msg => {
            socket.next(message);
            this.reset();
          },
          err => this.toastService.show({
            text: `Error code: ${err}`,
            type: 'warning',
          })
        )
      }
      else {
        console.log('this should not happen: no team');
      }
    }
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

  // <editor-fold desc='private connection related methods'>
  private createConnection(
    team: string,
    nick: string | undefined,
    oldUuid: string | undefined,
    callbacks: Array<(params: CallBackParameter) => void>) {
    this.socket = this.createSocket(team);

    this.socket.subscribe(msg => {

      switch(msg.type) {
        case MessageType.Error: {
          this.logErrorMessage(msg);
          this.toastService.show({
            text: `Error code: ${msg.data.code}`,
            type: 'warning',
          });

          if (msg.data.code === ErrorCode.TeamAlreadyExists ||
            msg.data.code === ErrorCode.TeamDoesNotExist ||
            msg.data.code === ErrorCode.ParticipantNotFound) {
            this.reset();
          }
          break;
        }
        case MessageType.Game: {
          this.logGameMessage(msg);
          // if we are not in there yet, this is the moment
          if (this.currentRoute !== '/game') {
            console.log('navigating to game');
            this.router.navigate(['game']);
          }
          this.game = msg.data;
          localStorage.setItem(this.localStorageTeamKey, team);
          break;
        }
        case MessageType.Self: {
          this.logParticipantMessage(msg);
          // if this is the very first response from the server, execute the callbacks
          // this will occur only once
          if (msg.reason === Reason.Init) {
            const callBackParams: CallBackParameter = {
              uuid: msg.data.uuid,
              team: team,
              nick: nick,
              oldUuid: oldUuid
            }
            callbacks.forEach(callback => callback(callBackParams));
          }
          this.self = new Participant(msg.data, true);
          localStorage.setItem(this.localStorageNickKey, this.self.nick);
          localStorage.setItem(this.localStorageUuidKey, this.self.uuid);
          break;
        }
        case MessageType.Participant: {
          this.logParticipantMessage(msg);
          const participant: Participant = new Participant(msg.data, false);
          if (participant.status === ParticipantStatus.Left)
          {
            this.toastService.show({
              text: `'${participant.nick}' has left.`,
              type: 'info',
            });
            this.participants.remove(participant.uuid);
          } else {
            if (msg.reason !== Reason.Init && !this.participants.getValue(participant.uuid)) {
              this.toastService.show({
                text: `'${participant.nick}' joined.`,
                type: 'info',
              });
            }
            this.participants.setValue(participant.uuid, participant);
          }
          break;
        }
        case MessageType.Ping: {
          this.logPingMessage(msg)
          break;
        }
        default: {
          console.log(`MessageType ?: ${msg}`);
        }
      }
    },
    err => this.toastService.show({
      text: `Error code: ${err}`,
      type: 'warning',
    }),
    () => {
      if (this.currentRoute === '/game') {
        this.toastService.show({
          text: `You have been disconnected`,
          type: 'warning',
        });
      }
    });
  }

  private createSocket(team: string): Subject<Message> {
    console.log(`in createsocket: ${team}`);
    return <Subject<Message>>this.websocketService
			.connect(`ws://localhost:3001/game/${encodeURI(team)}`)
			.pipe(map((response: MessageEvent): Message => {
        console.log(response.data);
				const message: Message = JSON.parse(response.data);
        return message;
			}));
  }

  private reset() {
    if (this.socket) {
      this.socket.unsubscribe();
    }
    this.websocketService.disconnect();
    this.game = undefined;
    this.self = undefined;
    localStorage.removeItem(this.localStorageNickKey);
    localStorage.removeItem(this.localStorageUuidKey);
    localStorage.removeItem(this.localStorageTeamKey);

    if (this.currentRoute !== '/home') {
      console.log('navigating to home');
      this.router.navigate(['home']);
    }
  }

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

  // <editor-fold desc='logger methods'>
  private logErrorMessage(message: Message) {
    console.log({
      message: {
        reason: Reason[message.reason],
        type: MessageType[message.type]
      },
      code: ErrorCode[message.data.code],
      error: message.data.message
    });
  }

  private logGameMessage(message: Message) {
    console.log({
      message: {
        reason: Reason[message.reason],
        type: MessageType[message.type]
      },
      team: message.data.team,
      cards: message.data.cards
    });
  }

  private logParticipantMessage(message: Message) {
    console.log({
      message: {
        reason: Reason[message.reason],
        type: MessageType[message.type]
      },
      status: ParticipantStatus[message.data.status],
      nick: message.data.nick,
      uuid: message.data.uuid,
      role: Role[message.data.role]
    });
  }

  private logPingMessage(message: Message) {
    console.log({
      message: {
        reason: Reason[message.reason],
        type: MessageType[message.type]
      },
      data: message.data
    });
  }
  // </editor-fold>
}
