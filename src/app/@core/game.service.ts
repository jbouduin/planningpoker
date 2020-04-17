import { Injectable } from '@angular/core';
// import { Socket } from 'ngx-socket-io';
import * as io from 'socket.io-client';
/*
export class Comment {
    id: string;
    name: string;
    comment: string;
}
*/
export interface Event {
  eventName: string,
  message: any
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  socket: io.Socket;
  constructor(
    //private socket: Socket
  ) {
    console.log('in Gameservice constructor');
  }

  initConnection(callBack: (bool) => void ): void {
    this.socket = io('http://localhost:3001', { path: '/game', transports: ['websocket'], upgrade: true});
    // this.socket.on(
    //   'connected',
    //   (test) => {
    //
    //     console.log('calling connect callback');
    //     callBack(true);
    //   }
    // );
    this.socket.on('message', message => console.log(message));
    console.log(this.socket);
    //const value = {
    //  id: 'id',
    //  name: 'name',
    //  comment: 'comment'
    // };
    // console.log('emitting');
    // this.socket.emit('message', value, (res: any) => console.log(res));
  }



}
