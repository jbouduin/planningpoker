import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import * as Collections from 'typescript-collections';

import { DtoGame, DtoParticipant } from '../../../projects/shared-lib/lib';
import { Message, MessageType, Verb } from '../../../projects/shared-lib/lib';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {

  // public properties
  public game?: DtoGame;
  public self?: DtoParticipant;
  public participants: Collections.Dictionary<string, DtoParticipant>;

  // private properties
  private socket?: Subject<Message>;

  // constructor
  public constructor(
    private router: Router,
    private websocketService: WebsocketService) {

    this.participants = new Collections.Dictionary<string, DtoParticipant>();
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

  // private methods
  private createConnection(
    team: string,
    nick: string,
    teamCallback: (uuid: string, team: string) => void) {
    this.socket = this.createSocket(team);
    this.socket.subscribe(msg => {
      console.log(msg);
      // if the message is not an error message
      if (msg.type !== MessageType.Error)
      {
        // check if we still have to set our nick
        if (!this.self) {
          this.changeNick(msg.data.uuid, nick);
        }
        // check if we already belong to a team
        // if not do the appropriate action
        if (!this.game) {
          teamCallback(msg.data.uuid, nick);
        }
      }

      switch(msg.type) {
        case MessageType.Error: {
          console.log(msg.data);
          // Todo: close the socket in some cases...
          break;
        }
        case MessageType.Game: {
          console.log(msg.data);
          // if we are not in there yet, this is the moment
          if (!this.game) {
            this.router.navigate(['game']);
          }
          this.game = msg.data;
          break;
        }
        case MessageType.Self: {
          this.self = msg.data;
          console.log('setting self');
          console.log(this.self);
          break;
        }
        case MessageType.Participant: {
          const participant: DtoParticipant = msg.data;
          console.log(msg.data);
          this.participants.setValue(participant.uuid, participant);
          break;
        }
        case MessageType.Ping: {
          console.log(`Ping received: ${msg.data}`);
          console.log('me:')
          console.log(this.self);
          console.log('the others:')
          this.participants.values().forEach(participant => console.log(participant));
          break;
        }
        default: {
          console.log('unknown message type');
        }
      }
    });
  }

  private createSocket(team: string): Subject<Message> {
    return <Subject<Message>>this.websocketService
			.connect(`ws://localhost:3001/game/${encodeURI(team)}`)
			.pipe(map((response: MessageEvent): Message => {
        console.log(response);
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
