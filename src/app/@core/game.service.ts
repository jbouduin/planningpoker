import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import * as Collections from 'typescript-collections';

import { DtoParticipant, Message, MessageType, Verb } from '../../../projects/shared-lib/lib';
import { WebsocketService } from './websocket.service';



@Injectable({
  providedIn: 'root',
})
export class GameService {

  private communicator?: Subject<Message>;

  private self?: DtoParticipant;
  private participants: Collections.Dictionary<string, DtoParticipant>;

  public constructor(private websocketService: WebsocketService) {

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
    this.communicator = this.createSocket();
    this.communicator.subscribe(msg => {
      console.log(msg);
      switch(msg.type) {
        case MessageType.Self: {
          if (!this.self) {
            this.changeNick(msg.data.uuid, screenName);
          }
          this.self = msg.data;
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

  private createSocket(): Subject<Message> {
    return <Subject<Message>>this.websocketService
			.connect('ws://localhost:3001/game')
			.pipe(map((response: MessageEvent): Message => {
        console.log(response);
				const message: Message = JSON.parse(response.data);
        return message;
			}));
  }

}
