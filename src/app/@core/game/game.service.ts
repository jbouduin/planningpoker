import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import * as Collections from 'typescript-collections';

import { DtoGame, Role } from '../../../../projects/shared-lib/lib';
import { ErrorCode, Message, MessageType, Verb } from '../../../../projects/shared-lib/lib';
import { ToastService } from '../../toast'
import { WebsocketService } from '../websocket.service';
import { Participant } from './participant';

@Injectable({
  providedIn: 'root',
})
export class GameService {

  // public properties
  public game?: DtoGame;
  public self?: Participant;
  public participants: Collections.Dictionary<string, Participant>;

  // private properties
  private socket?: Subject<Message>;
  private nickInitialized = false;
  private gameInitialized = false;

  // constructor
  public constructor(
    private router: Router,
    private websocketService: WebsocketService,
    private toastService: ToastService) {
    this.participants = new Collections.Dictionary<string, Participant>();
    console.log('in Gameservice constructor');
  }

  // public methods
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

  public join(team: string, nick: string): void {
    console.log(`joining: ${nick}@${team}`);
    this.createConnection(team, nick, this.joinTeam.bind(this));
  }

  public create(team: string, nick: string): void {
    console.log(`creating: ${nick}@${team}`);
    this.createConnection(team, nick, this.createTeam.bind(this));
  }

  public developers(): Array<Participant> {
    const result = new Array<Participant>();
    if (this.self?.role === Role.Developer) {
      result.push(this.self);
    }
    return result.concat(
      this.participants.values().filter(participant => participant.role === Role.Developer)
    );
  }

  public scrumMaster(): Participant | undefined {
    if (this.self?.role === Role.ScrumMaster) {
      return this.self;
    }
    const result = this.participants.values()
      .filter(participant => participant.role === Role.ScrumMaster)[0];
    return result ? result : undefined;
  }
  // private methods
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
            if (this.socket) {
              this.socket.unsubscribe();
            }
            this.websocketService.disconnect();
          }
          break;
        }
        case MessageType.Game: {
          console.log(`MessageType: Game`);
          console.log(msg.data);
          // if we are not in there yet, this is the moment
          if (!this.game) {
            console.log('navigating to game')
            this.router.navigate(['game']);
          }
          this.game = msg.data;
          break;
        }
        case MessageType.Self: {
          console.log(`MessageType: Self`);
          console.log(msg.data);
          this.self = new Participant(msg.data, true);
          break;
        }
        case MessageType.Participant: {
          console.log(`MessageType: Participant`);
          console.log(msg.data);
          const participant: Participant = new Participant(msg.data, false);

          this.participants.setValue(participant.uuid, participant);
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
}
