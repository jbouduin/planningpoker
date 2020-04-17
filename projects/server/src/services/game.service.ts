import { Application, Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';
import * as ws from 'ws';

import { Game, Participant } from '../../../shared-lib/lib';

export interface IGameService {
  setRoutes(expressWS: expressWs.Instance): void;
}

@injectable()
export class GameService implements IGameService {

  // private properties
  private game: Game;

  // constructor
  public constructor() {
    this.game = new Game('root');
  }

  public setRoutes(expressWs: expressWs.Instance): void {
    const router = Router() as expressWs.Router;
    const wss = expressWs.getWss();
    wss.on('connection', (ws, req) => {
      console.log(`${new Date().toLocaleString()}: connection from client ${req.headers['sec-websocket-key']}`);
      const newParticipant = this.game.addNewParticipant(ws);

      this.broadcastToOthers(wss, ws, `${newParticipant.nick} entered the room`);
      this.answerToSender(ws, `your name is ${newParticipant.nick}`);
      if (this.game.size() === 1) {
        this.answerToSender(ws, `you are the first participant`);
      } else {
        this.answerToSender(ws, `the other participants are:`);
        this.broadcastToOthers(wss, ws, `There are now ${this.game.size()} participants`);
        this.game.participants(participant => participant.uuid !== newParticipant.uuid)
          .forEach(participant => this.answerToSender(ws, `*  ${participant.nick}`));
      }

      ws.on('close', (number, reason) => {
        const leaving = this.game.participants(participant => participant.socket == ws)[0];
        if (leaving) {
          console.log(`${new Date().toLocaleString()}: ${leaving.nick} has been disconnected`);
          this.broadcastToOthers(wss, ws, `${leaving.nick} has been disconnected`);
          this.game.remove(leaving.uuid);
          this.broadcastToOthers(wss, ws, `${this.game.size()} are left`);
        }
      });
    });

    router.ws(
      '/',
      (ws, req, next) => {
        ws.on('message', (msg: string) => {
          this.broadcastToOthers(wss, ws,`${new Date().toLocaleString()}: message => ${msg}`);
          console.log(`${new Date().toLocaleString()}: message received => ${msg}`);
        });
    });

    expressWs.app.use('/game', router);
  }

  // private helper methods
  private broadcastToOthers(wss: ws.Server, sender: any, message: string): void {
    Array.from(wss.clients)
      .filter( client => client != sender)
      .forEach( client => client.send(message));
  }

  private answerToSender(sender: any, message: string) {
    sender.send(message);
  }
}
