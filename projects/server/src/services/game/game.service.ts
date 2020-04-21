import { Application, Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';
import * as ws from 'ws';

import { ErrorCode, Message, MessageType, ParticipantStatus, Role, Verb } from '../../../../shared-lib/lib';
import { ICardService } from '../card';
import { Game } from './game';
import { Participant } from './participant';

import SERVICETYPES from '../service.types';

export interface IGameService {
  initializeGame(expressWS: expressWs.Instance): void;
}

@injectable()
export class GameService implements IGameService {

  // <editor-fold desc='Private properties'>
  private cnt: number;
  private games: Collections.Dictionary<string, Game>;
  private participants: Collections.Dictionary<string, Participant>;
  private participantGameMap: Collections.Dictionary<string, string>;
  private pingInterval: number;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.CardService) private cardService: ICardService) {
    console.log('gameservice constructor');
    this.cnt = 0;
    this.games = new Collections.Dictionary<string, Game>();
    this.participants = new Collections.Dictionary<string, Participant>();
    this.participantGameMap = new Collections.Dictionary<string, string>();
    this.pingInterval = 0;
  }
  // </editor-fold>

  // <editor-fold desc='Interface members'>
  public initializeGame(expressWs: expressWs.Instance): void {
    const router = Router() as expressWs.Router;
    const wss = expressWs.getWss();
    wss.on('connection', (ws, req) => {
      // new connection:
      // store in the participants collection
      // assign it an uuid and send the participant back to the sender
      const param = req['params'] ?req['params'].team : 'not specified';
      const uuid = Uuid();
      const newParticipant = new Participant(
        `participant ${++this.cnt}`,
        uuid,
        Role.Undefined,
        ws);
      this.participants.setValue(uuid, newParticipant);
      console.log(`${new Date().toLocaleString()}: connection from client '${req.headers['sec-websocket-key']}' entered as '${newParticipant.nick}' in '${param}'`);
      this.sendParticipant(ws, MessageType.Self, newParticipant);

      // if an existing connection closes
      // set the connection status to disconnected
      // if the user was in a game: send other participants an update
      ws.on('close', (number, reason) => {
        const closed = this.participants.values().filter(participant => participant.socket == ws)[0];
        if (closed) {
          console.log(`${new Date().toLocaleString()}: '${closed.nick}'' has been disconnected`);
          closed.status = ParticipantStatus.Disconnected;
          const gameName = this.participantGameMap.getValue(closed.uuid);
          if (gameName) {
            console.log('sending to other participants');
            const game = this.games.getValue(gameName);
            this.broadcastParticipantToOthers(game, closed);
          } else {
            console.log('participant was not in a game');
          }
        }
      });
    });

    router.ws(
      '/:team',
      (ws, req, next) => {
        ws.on('message', (msg: string) => {
          console.log(`${new Date().toLocaleString()}: message received => ${msg}`);
          try {
            // parse the message
            const message: Message = JSON.parse(msg);
            // find the participant by uuid
            // if not found: send error message back
            const sender = this.participants.getValue(message.uuid);
            if (!sender) {
              console.log(`participant with 'uuid' ${message.uuid} not found`);
              this.sendErrorMessage(ws, ErrorCode.ParticipantNotFound);
            } else {

              const team = req.params.team;
              const game = this.games.getValue(team);
              switch (message.type) {
                case (Verb.Create) : {
                  console.log(`message type: Create`);
                  if (game) {
                    console.log(`Create: '${sender.nick}' is trying to create existing team '${message.data}'`);
                    this.sendErrorMessage(ws, ErrorCode.TeamAlreadyExists);
                  } else {
                    console.log(`Create: '${sender.nick}' is creating '${message.data}'`);
                    const newGame = new Game(message.data);
                    sender.role = Role.ScrumMaster;
                    newGame.upsertParticipant(sender);
                    this.games.setValue(team, newGame);
                    this.participantGameMap.setValue(message.uuid, team);
                    // send the creator himself to tell him that he is now Scrum Master
                    this.sendParticipant(ws, MessageType.Self, sender);
                    this.sendGame(ws, newGame);
                  }
                  break;
                }
                case (Verb.Join) : {
                  if (!game) {
                    console.log(`Join: '${sender.nick}' is trying to join non existing team.`);
                    this.sendErrorMessage(ws, ErrorCode.TeamDoesNotExist);
                  } else {
                    console.log(`Join: '${sender.nick}' is joining '${game.team}'`);
                    sender.role = Role.Developer;
                    game.upsertParticipant(sender);
                    this.participantGameMap.setValue(message.uuid, team);
                    // send the joinee himself to tell him that he is now developer
                    this.sendParticipant(ws, MessageType.Self, sender);
                    // tell the others someone joined
                    this.broadcastParticipantToOthers(game, sender);
                    // send the new participant all other participants
                    game
                      .filterParticipants(participant => participant.uuid !== sender.uuid)
                      .forEach(participant => this.sendParticipant(ws, MessageType.Participant, participant));
                    // send the new participant the game
                    this.sendGame(ws, game);
                  }
                  break;
                }
                case (Verb.Leave) : {
                  if (!game) {
                    console.log(`Leave: '${sender.nick}' is trying to leave a game he is not participating`);
                    this.sendErrorMessage(ws, ErrorCode.TeamDoesNotExist);
                  } else {
                    console.log(`Leave: '${sender.nick}' is leaving '${game.team}'`);
                    game.deleteParticipant(sender.uuid);
                    this.participantGameMap.remove(sender.uuid);
                    this.participants.remove(sender.uuid);
                    // tell the others someone left
                    sender.status = ParticipantStatus.Left;
                    this.broadcastParticipantToOthers(game, sender);
                  }
                  break;
                }
                case (Verb.Nick) : {
                  console.log(`Nick: '${sender.nick}' => '${message.data}'`);
                  sender.nick = message.data;
                  // send the data back as aknowledgment
                  this.sendParticipant(ws, MessageType.Self, sender);
                  // check if this user is in a game:
                  // depending on the client implementation, it can be that the sender changes his nick before entering a game
                  if (game) {
                    this.broadcastParticipantToOthers(game, sender);
                  }
                  break;
                }
                default: {
                  console.log('unexpected messagetype');
                }
              } // end switch
            } // end of known uuid
        } catch (err) {
          this.sendErrorMessage(ws, ErrorCode.Error, err.message);
          console.log(err);
        }
      });
    });

    if (this.pingInterval > 0) {
      setInterval(
        () => {
          console.log(`${new Date().toLocaleString()}: ping`);
          wss.clients.forEach( client => {
            const message = JSON.stringify({
              type: MessageType.Ping,
              data: new Date().toLocaleString()
            });
            this.send(client, message);
          });
        },
        this.pingInterval);
    }

    expressWs.app.use('/game', router);
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private broadcastParticipantToOthers(game: Game, sender: Participant): void {
    game
      .filterParticipants(participant => participant.uuid !== sender.uuid && participant.status === ParticipantStatus.Connected)
      .forEach(participant => {
        this.sendParticipant(participant.socket, MessageType.Participant, sender);
      });
  }

  private sendParticipant(client: any, type: MessageType, participant: Participant): void {
    const message = JSON.stringify({
      type: type,
      data: {
        status: participant.status,
        nick: participant.nick,
        uuid: participant.uuid,
        role: participant.role
      }
    });
    this.send(client, message);
  }

  private sendGame(client: any, game: Game): void {
    const message = JSON.stringify({
      type: MessageType.Game,
      data: {
        team: game.team,
        cards: this.cardService.generateCardSet()
      }
    });
    this.send(client, message);
  }

  private sendErrorMessage(client: any, code: ErrorCode, message?: string): void {
    const msg = JSON.stringify({
      type: MessageType.Error,
      data: {
        code,
        message
      }
    });
    this.send(client, msg);
  }

  private send(client: any, message: string) {
    try {
      client.send(message);
    } catch (err) {
      console.log(err);
    }
  }
  // </editor-fold>
}
