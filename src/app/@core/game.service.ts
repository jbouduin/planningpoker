import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { WebsocketService } from './websocket.service';

export interface Message {
	event: string,
	data: string
}

@Injectable({
  providedIn: 'root',
})
export class GameService {

  constructor(private websocketService: WebsocketService) {
    console.log('in Gameservice constructor');
  }

  create(teamName: string, screenName: string): void {
    console.log(`creating: ${screenName}@${teamName}`);
    this.createSocket().subscribe(msg => {
      console.log(`Response from websocket: ${msg}`);
      console.log(msg);
    })
  }

  private createSocket(): Subject<Message> {
    // this.socket = socketIo('https://localhost:3001', { path: '/game', transports: ['ws'], upgrade: true });
    // <Subject<Message>>
    return <Subject<Message>>this.websocketService
			.connect('ws://localhost:3001/game')
			.pipe(map((response: MessageEvent): Message => {
        console.log(response);
				//let data = JSON.parse(response.data);
				return {
					event: '',
					data: response.data
				}
			}));
  }
}
