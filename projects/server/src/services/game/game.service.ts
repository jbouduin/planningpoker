import { Application, Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';
import * as ws from 'ws';

import { DtoParticipant, Message, MessageType, Verb } from '../../../../shared-lib/lib';
import { Game } from './game';
import { Participant } from './participant';

export interface IGameService {
  initializeGame(expressWS: expressWs.Instance): void;
}

@injectable()
export class GameService implements IGameService {

  // private properties
  private game: Game;

  // constructor
  public constructor() {
    this.game = new Game('root');
  }

  public initializeGame(expressWs: expressWs.Instance): void {
    const router = Router() as expressWs.Router;
    const wss = expressWs.getWss();
    wss.on('connection', (ws, req) => {
      const newParticipant = this.game.addNewParticipant(ws);
      console.log(`${new Date().toLocaleString()}: connection from client ${req.headers['sec-websocket-key']} entered as ${newParticipant.nick}`);
      this.broadcastParticipantToOthers(wss, ws, newParticipant);
      this.sendParticipant(ws, MessageType.Self, newParticipant);
      this.game
        .participants(participant => participant.uuid !== newParticipant.uuid)
        .forEach(participant => this.sendParticipant(ws, MessageType.Participant, participant));

      ws.on('close', (number, reason) => {
        const leaving = this.game.participants(participant => participant.socket == ws)[0];
        if (leaving) {
          console.log(`${new Date().toLocaleString()}: ${leaving.nick} has been disconnected`);
          leaving.connected = false;
          this.broadcastParticipantToOthers(wss, ws, leaving);
        }
      });
    });

    router.ws(
      '/',
      (ws, req, next) => {
        ws.on('message', (msg: string) => {
          console.log(`${new Date().toLocaleString()}: message received => ${msg}`);
          const message: Message = JSON.parse(msg);
          switch (message.type) {
            case (Verb.Nick) : {
              const changed = this.game.getParticipant(message.uuid);
              if (changed) {
                changed.nick = message.data;
                this.broadcastParticipantToOthers(wss, ws, changed);
              }
              break;
            }
            default: {
              console.log('unexpected messagetype');
            }
          }
        });
    });

    setInterval(
      () => {
        console.log(`${new Date().toLocaleString()}: ping`);
        wss.clients.forEach( client => {
          const message = JSON.stringify({
            type: MessageType.Ping,
            data: new Date().toLocaleString()
          });
          client.send(message);
        });
      },
      10000);

    expressWs.app.use('/game', router);
  }

  // private helper methods
  private broadcastParticipantToOthers(wss: ws.Server, sender: any, participant: Participant): void {
    Array.from(wss.clients)
      .filter( client => client != sender)
      .forEach( client => this.sendParticipant(client, MessageType.Participant, participant));
  }

  private sendParticipant(client: any, type: MessageType, participant: Participant): void {
    const message = JSON.stringify({
      type: type,
      data: {
        connected: participant.connected,
        nick: participant.nick,
        uuid: participant.uuid,
        role: participant.role
      }
    });
    client.send(message);
  }

}
