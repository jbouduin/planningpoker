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

  public game?: DtoGame;
  public self?: DtoParticipant;
  public participants: Collections.Dictionary<string, DtoParticipant>;

  private communicator?: Subject<Message>;

  public constructor(
    private router: Router,
    private websocketService: WebsocketService) {

    this.participants = new Collections.Dictionary<string, DtoParticipant>();
    console.log('in Gameservice constructor');
  }

  public changeNick(uuid: string, nick: string): void {
    if (this.communicator) {
      const message: Message = {
        type: Verb.Nick,
        uuid,
        data: nick
      };
      this.communicator.next(message);
    }
  }

  public create(teamName: string, screenName: string): void {
    console.log(`creating: ${screenName}@${teamName}`);

    this.communicator = this.createSocket(teamName);
    this.communicator.subscribe(msg => {
      console.log(msg);
      switch(msg.type) {
        case MessageType.Error: {
          console.log(msg.data);
          // Todo: close the socket in some cases...
          break;
        }
        case MessageType.Game: {
          console.log(msg.data);
          this.game = msg.data;
          this.router.navigate(['game']);
          break;
        }
        case MessageType.Self: {
          if (!this.self) {
            // TODO: this way we do not catch game already exists
            this.changeNick(msg.data.uuid, screenName);
            this.createTeam(msg.data.uuid);
          }
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

  private createSocket(teamName: string): Subject<Message> {
    return <Subject<Message>>this.websocketService
			.connect(`ws://localhost:3001/game/${encodeURI(teamName)}`)
			.pipe(map((response: MessageEvent): Message => {
        console.log(response);
				const message: Message = JSON.parse(response.data);
        return message;
			}));
  }

  private createTeam(uuid: string) {
    if (this.communicator) {
      const message: Message = {
        type: Verb.Create,
        uuid,
        data: ''
      };
      this.communicator.next(message);
    }
  }
}
