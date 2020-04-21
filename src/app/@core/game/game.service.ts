import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as Collections from 'typescript-collections';

import { DtoCard, DtoGame, ParticipantStatus, Role } from '../../../../projects/shared-lib/lib';
import { ErrorCode, Message, MessageType, Verb } from '../../../../projects/shared-lib/lib';
import { ToastService } from '../../toast'
import { WebsocketService } from '../websocket.service';

import { Game } from './game';
import { Participant } from './participant';

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
  private nickInitialized = false;
  private gameInitialized = false;
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

  // <editor-fold desc='public methods'>

  // <editor-fold desc='verb related methods'>
  public changeNick(uuid: string, nick: string): void {
    if (this.socket) {
      const message: Message = {
        type: Verb.Nick,
        uuid,
        data: nick
      };
      this.socket.next(message);
    }
  }

  public create(team: string, nick: string): void {
    console.log(`creating: ${nick}@${team}`);
    this.createConnection(team, nick, this.createTeam.bind(this));
  }

  public join(team: string, nick: string): void {
    console.log(`joining: ${nick}@${team}`);
    this.createConnection(team, nick, this.joinTeam.bind(this));
  }

  public leave(): void {
    const message: Message = {
      type: Verb.Leave,
      uuid: this.myUuid,
      data: ''
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
  }
  // </editor-fold>

  // </editor-fold>

  // <editor-fold desc='private methods'>

  // <editor-fold desc='connection related methods'>
  private createConnection(
    team: string,
    nick: string,
    teamCallback: (uuid: string, team: string) => void) {
    this.socket = this.createSocket(team);

    this.socket.subscribe(msg => {
      // if the message is not an error message
      if (msg.type !== MessageType.Error)
      {
        // check if we still have to set our nick
        if (!this.nickInitialized) {
          this.changeNick(msg.data.uuid, nick);
          this.nickInitialized = true;
        }
        // check if we already belong to a team
        // if not do the appropriate action
        if (!this.gameInitialized) {
          teamCallback(msg.data.uuid, team);
          this.gameInitialized = true;
        }
      }

      switch(msg.type) {
        case MessageType.Error: {
          console.log(`MessageType: Error`);
          console.log(msg.data);
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
          console.log(`MessageType: Game`);
          console.log(msg.data);
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
          console.log(`MessageType: Self`);
          console.log(msg.data);
          this.self = new Participant(msg.data, true);
          localStorage.setItem(this.localStorageNickKey, this.self.nick);
          localStorage.setItem(this.localStorageUuidKey, this.self.uuid);
          break;
        }
        case MessageType.Participant: {
          console.log(`MessageType: Participant`);
          console.log(msg.data);
          const participant: Participant = new Participant(msg.data, false);
          if (participant.status === ParticipantStatus.Left)
          {
            this.toastService.show({
              text: `'${participant.nick}' has left.`,
              type: 'info',
            });
            this.participants.remove(participant.uuid);
          } else {
            // TODO: difference between the participants arriving after joining
            // and someone really entering the game
            if (!this.participants.containsKey(participant.uuid)) {
              this.toastService.show({
                text: `'${participant.nick}' connected.`,
                type: 'info',
              });
            }
            this.participants.setValue(participant.uuid, participant);
          }
          break;
        }
        case MessageType.Ping: {
          console.log(`MessageType: Ping`);
          console.log(msg.data);
          console.log('me:')
          console.log(this.self);
          console.log('the others:')
          this.participants.values().forEach(participant => console.log(participant));
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
    return <Subject<Message>>this.websocketService
			.connect(`ws://localhost:3001/game/${encodeURI(team)}`)
			.pipe(map((response: MessageEvent): Message => {
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
    this.gameInitialized = false;
    this.nickInitialized = false;
    localStorage.removeItem(this.localStorageNickKey);
    localStorage.removeItem(this.localStorageUuidKey);
    localStorage.removeItem(this.localStorageTeamKey);

    if (this.currentRoute !== '/home') {
      console.log('navigating to home');
      this.router.navigate(['home']);
    }
  }
  // </editor-fold>

  // <editor-fold desc='teamCallback methods'>

  private createTeam(uuid: string, team: string) {
    if (this.socket) {
      const message: Message = {
        type: Verb.Create,
        uuid,
        data: team
      };
      this.socket.next(message);
    }
  }

  private joinTeam(uuid: string, team: string) {
    if (this.socket) {
      const message: Message = {
        type: Verb.Join,
        uuid,
        data: team
      };
      this.socket.next(message);
    }
  }
  // </editor-fold>

  // </editor-fold>
}
