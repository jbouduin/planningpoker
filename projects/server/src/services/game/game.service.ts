import { Application, Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';
import * as ws from 'ws';

import { ErrorCode, Message, MessageType, ParticipantStatus, Reason, Role, Verb } from '../../../../shared-lib/lib';
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
    console.log(`${new Date().toISOString()}: gameservice constructor`);
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
      const param = req['params'] ? req['params'].team : 'not specified';
      const uuid = Uuid();
      const newParticipant = new Participant(
        `participant ${++this.cnt}`,
        uuid,
        Role.Undefined,
        ws);
      this.participants.setValue(uuid, newParticipant);
      console.log(`${new Date().toISOString()}: connection from client '${req.headers['sec-websocket-key']}' entered as '${newParticipant.nick}' in '${param}'`);
      // send the participant himself back, so he knows his assigned uuid
      this.sendParticipant(ws, Reason.Init, MessageType.Self, newParticipant);

      // if an existing connection closes
      // set the connection status to disconnected
      // if the user was in a game: send other participants an update
      ws.on('close', (number, reason) => {
        const closed = this.participants.values().filter(participant => participant.socket == ws)[0];
        if (closed) {
          console.log(`${new Date().toISOString()}: '${closed.nick}'' has been disconnected`);
          closed.status = ParticipantStatus.Disconnected;
          const game = this.getGameOfUuid(closed.uuid);
          if (game) {
            console.log('sending to other participants');
            this.broadcastParticipantToOthers(game, Reason.Change, closed);
          } else {
            console.log('participant was unknown or not in a valid game');
          }
        }
      });
    });

    router.ws(
      '/:team',
      (ws, req, next) => {
        ws.on('message', (msg: string) => {
          console.log(`${new Date().toISOString()}: <= ${msg}`);
          try {
            // parse the message
            const message: Message = JSON.parse(msg);
            // find the participant by uuid
            // if not found: send error message back
            const sender = this.participants.getValue(message.uuid);
            if (!sender) {
              console.log(`participant with uuid '${message.uuid}' not found`);
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
                    this.sendParticipant(ws, Reason.Change, MessageType.Self, sender);
                    this.sendGame(ws, Reason.Init, newGame);
                  }
                  break;
                }
                case (Verb.Join) : {
                  if (!game) {
                    console.log(`Join: '${sender.nick}' is trying to join non existing team '${message.data}'.`);
                    this.sendErrorMessage(ws, ErrorCode.TeamDoesNotExist);
                  } else {
                    console.log(`Join: '${sender.nick}' is joining '${game.team}'`);
                    sender.role = Role.Developer;
                    game.upsertParticipant(sender);
                    this.participantGameMap.setValue(message.uuid, team);
                    // send the joinee himself to tell him that he is now developer
                    this.sendParticipant(ws, Reason.Change, MessageType.Self, sender);
                    // tell the others someone joined
                    this.broadcastParticipantToOthers(game, Reason.Change, sender);
                    // send the new participant all other participants
                    this.broadcastOthersToParticipant(game, Reason.Init, sender);
                    // send the new participant the game
                    this.sendGame(ws, Reason.Init, game);
                  }
                  break;
                }
                case (Verb.Leave) : {
                  if (!game) {
                    console.log(`Leave: '${sender.nick}' is trying to leave a game he is not participating`);
                    this.sendErrorMessage(ws, ErrorCode.TeamDoesNotExist);
                  } else {
                    console.log(`Leave: '${sender.nick}' is leaving '${game.team}'`);
                    // remove participant from game and dictionaries
                    game.deleteParticipant(sender.uuid);
                    this.participantGameMap.remove(sender.uuid);
                    this.participants.remove(sender.uuid);
                    // tell the others someone left
                    sender.status = ParticipantStatus.Left;
                    this.broadcastParticipantToOthers(game, Reason.Change, sender);
                  }
                  break;
                }
                case (Verb.Nick) : {
                  console.log(`Nick: '${sender.nick}' => '${message.data}'`);
                  sender.nick = message.data;
                  // send the data back as aknowledgment
                  this.sendParticipant(ws, Reason.Change, MessageType.Self, sender);
                  // check if this user is in a game:
                  // depending on the client implementation, it can be that the sender changes his nick before entering a game
                  if (game) {
                    this.broadcastParticipantToOthers(game, Reason.Change, sender);
                  }
                  break;
                }
                case (Verb.Switch): {
                  console.log(`Switch: '${message.uuid}' => '${message.data}' `);
                  const oldParticipant = this.participants.getValue(message.data);
                  if (!oldParticipant) {
                    this.sendErrorMessage(ws, ErrorCode.ParticipantNotFound);
                  } else {
                    const oldGame = this.getGameOfUuid(message.data)
                    if (!oldGame) {
                      this.sendErrorMessage(ws, ErrorCode.TeamDoesNotExist);
                    } else {
                      this.participants.remove(sender.uuid);
                      oldParticipant.status = ParticipantStatus.Connected;
                      oldParticipant.socket = ws;
                      // update self to reflect the new-old uuid
                      this.sendParticipant(ws, Reason.Change, MessageType.Self, oldParticipant);
                      // tell the others that participant rejoined
                      this.broadcastParticipantToOthers(game, Reason.Change, oldParticipant);
                      // send the game data to the participant
                      this.broadcastOthersToParticipant(game, Reason.Init, oldParticipant);
                      this.sendGame(ws, Reason.Init, game);
                    }
                  }
                  break;
                }
                default: {
                  this.sendErrorMessage(ws, ErrorCode.UnknownVerb);
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
          console.log(`${new Date().toISOString()}: ping`);
          wss.clients.forEach( client => {
            const message: Message = {
              type: MessageType.Ping,
              data: new Date().toISOString(),
              uuid: '',
              reason: Reason.Refresh
            };
            this.send(client, JSON.stringify(message));
          });
        },
        this.pingInterval);
    }

    expressWs.app.use('/game', router);
  }
  // </editor-fold>

  // <editor-fold desc='Private methods to send messages'>
  private broadcastParticipantToOthers(game: Game, reason: Reason, participant: Participant): void {
    game
      .filterParticipants(other => other.uuid !== participant.uuid && other.status === ParticipantStatus.Connected)
      .forEach(other => this.sendParticipant(other.socket, reason, MessageType.Participant, participant) );
  }

  private broadcastOthersToParticipant(game: Game, reason: Reason, participant: Participant): void {
    game
      .filterParticipants(other => other.uuid !== participant.uuid)
      .forEach(other => this.sendParticipant(participant.socket, reason, MessageType.Participant, other));
  }

  private sendParticipant(client: any, reason: Reason, type: MessageType, participant: Participant): void {
    const message: Message = {
      type: type,
      data: {
        status: participant.status,
        nick: participant.nick,
        uuid: participant.uuid,
        role: participant.role
      },
      uuid: '',
      reason
    };
    this.send(client, JSON.stringify(message));
  }

  private sendGame(client: any, reason: Reason, game: Game): void {
    const message: Message = {
      type: MessageType.Game,
      data: {
        team: game.team,
        cards: this.cardService.generateCardSet()
      },
      uuid: '',
      reason
    };
    this.send(client, JSON.stringify(message));
  }

  private sendErrorMessage(client: any, code: ErrorCode, message?: string): void {
    console.log(code);
    const msg: Message = {
      uuid: '',
      type: MessageType.Error,
      data: {
        code,
        message
      },
      reason: Reason.Error
    };
    this.send(client, JSON.stringify(msg));
  }

  private send(client: any, message: string) {
    // TODO: check ws status
    console.log(`${new Date().toISOString()}: => ${message}`);
    try {
      client.send(message);
    } catch (err) {
      console.log(`${new Date().toISOString()}: => ${err}`);
    }
  }
  // </editor-fold>

  // <editor-fold desc='Private helpers'>
  private getGameOfUuid(uuid: string): Game {
    const gameName = this.participantGameMap.getValue(uuid);
    return this.games.getValue(gameName);
  }
  // </editor-fold>
}
