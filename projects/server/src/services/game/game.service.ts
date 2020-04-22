import { Application, Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';
import * as ws from 'ws';

import {
  ErrorCode,
  GameStatus,
  Message,
  MessageType,
  ParticipantStatus,
  Reason,
  Role,
  Verb
} from '../../../../shared-lib/lib';
import { ICardService } from '../card';

import { Estimation } from './estimation';
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
      // TODO: (#693) const param = req['params'] ? req['params'].team : 'not specified';
      const uuid = Uuid();
      const newParticipant = new Participant(
        `participant ${++this.cnt}`,
        uuid,
        Role.Unknown,
        ws);
      this.participants.setValue(uuid, newParticipant);
      console.log(`${new Date().toISOString()}: connection from client '${req.headers['sec-websocket-key']}' entered as '${newParticipant.nick}' in '{TODO (#693) param}'`);
      // send the participant himself back, so he knows his assigned uuid
      this.sendParticipants(newParticipant, Reason.Init, MessageType.Self, [ newParticipant ]);

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
          try {
            // parse the message
            const message: Message = JSON.parse(msg);
            console.log(`${new Date().toISOString()}: <= ${Verb[message.type]}: ${msg}`);
            // find the participant by uuid
            // if not found: send error message back
            const sender = this.participants.getValue(message.uuid);
            if (!sender) {
              console.log(`participant with uuid '${message.uuid}' not found`);
              this.sendParticipantNotFound(ws, message.uuid);
            } else {
              // TODO (#692) one single method that checks if a team is required
              const team = req.params.team;
              const game = this.games.getValue(team);
              switch (message.type) {
                case (Verb.Create): {
                  console.log(`message type: Create`);
                  if (game) {
                    console.log(`Create: '${sender.nick}' is trying to create existing team '${message.data}'`);
                    this.sendErrorMessage(sender, ErrorCode.TeamAlreadyExists);
                  } else {
                    console.log(`Create: '${sender.nick}' is creating '${message.data}'`);
                    const newGame = new Game(message.data);
                    sender.role = Role.ScrumMaster;
                    newGame.upsertParticipant(sender);
                    this.games.setValue(team, newGame);
                    this.participantGameMap.setValue(message.uuid, team);
                    // send the creator himself to tell him that he is now Scrum Master
                    this.sendParticipants(sender, Reason.Change, MessageType.Self, [ sender ]);
                    this.sendGame(sender, Reason.Init, newGame);
                    this.sendCards(sender);
                  }
                  break;
                }
                case (Verb.Estimate): {
                  if (!game) {
                    console.log(`Estimate: '${sender.nick}' is trying to estimate without being in a team.`);
                    this.sendErrorMessage(sender, ErrorCode.ParticipantNotInTeam);
                  } else {
                    const estimation = new Estimation(sender.uuid, message.data);
                    if (estimation.card >= 0) {
                      game.upsertEstimation(estimation);
                    }
                    else {
                      game.deleteEstimation(estimation);
                    }
                    this.broadCastEstimation(game, estimation);
                  }
                  break;
                }
                case (Verb.Join): {
                  if (!game) {
                    console.log(`Join: '${sender.nick}' is trying to join non existing team '${message.data}'.`);
                    this.sendErrorMessage(sender, ErrorCode.TeamDoesNotExist);
                  } else {
                    console.log(`Join: '${sender.nick}' is joining '${game.team}'`);
                    sender.role = Role.Developer;
                    game.upsertParticipant(sender);
                    this.participantGameMap.setValue(message.uuid, team);
                    // TODO (#697) group all following calls in one single send
                    // send the joinee himself to tell him that he is now developer
                    this.sendParticipants(sender, Reason.Change, MessageType.Self, [ sender ]);
                    // tell the others someone joined
                    this.broadcastParticipantToOthers(game, Reason.Change, sender);
                    // send the new participant all other participants
                    this.broadcastOthersToParticipant(game, Reason.Init, sender);
                    // send the new participant the game
                    this.sendGame(sender, Reason.Init, game);
                    // send the new participant the cards
                    this.sendCards(sender);
                    // send the new participant the dtoEstimations
                    this.sendEstimations(sender, game.status === GameStatus.Revealed, game.allEstimations());
                  }
                  break;
                }
                case (Verb.Leave): {
                  if (!game) {
                    console.log(`Leave: '${sender.nick}' is trying to leave a game he is not participating`);
                    this.sendErrorMessage(sender, ErrorCode.TeamDoesNotExist);
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
                case (Verb.Nick): {
                  console.log(`Nick: '${sender.nick}' => '${message.data}'`);
                  sender.nick = message.data;
                  // send the data back as aknowledgment
                  this.sendParticipants(sender, Reason.Change, MessageType.Self, [ sender ]);
                  // check if this user is in a game:
                  // depending on the client implementation, it can be that the sender changes his nick before entering a game
                  if (game) {
                    this.broadcastParticipantToOthers(game, Reason.Change, sender);
                  }
                  break;
                }
                case (Verb.Reveal): {
                  if (!game) {
                    console.log(`Estimate: '${sender.nick}' is trying to estimate without being in a team'.`);
                    this.sendErrorMessage(sender, ErrorCode.ParticipantNotInTeam);
                  } else {
                    if (sender.role !== Role.ScrumMaster) {
                      this.sendErrorMessage(sender, ErrorCode.ScrumMasterRequired);
                    } else {
                      game.reveal();
                      this.broadCastGame(game);
                      this.broadCastAllEstimations(game);
                    }
                  }
                  break;
                }
                case (Verb.Start): {
                  if (!game) {
                    console.log(`Estimate: '${sender.nick}' is trying to estimate without being in a team'.`);
                    this.sendErrorMessage(sender, ErrorCode.ParticipantNotInTeam);
                  } else {
                    if (sender.role !== Role.ScrumMaster) {
                      this.sendErrorMessage(sender, ErrorCode.ScrumMasterRequired);
                    } else {
                      game.startEstimating();
                      this.broadCastClearEstimations(game);
                      this.broadCastGame(game);
                    }
                  }
                  break;
                }
                case (Verb.Switch): {
                  console.log(`Switch: '${message.uuid}' => '${message.data}' `);
                  const oldParticipant = this.participants.getValue(message.data);
                  if (!oldParticipant) {
                    this.sendErrorMessage(sender, ErrorCode.ParticipantNotFound);
                  } else {
                    const oldGame = this.getGameOfUuid(message.data)
                    if (!oldGame) {
                      this.sendErrorMessage(sender, ErrorCode.TeamDoesNotExist);
                    } else {
                      this.participants.remove(sender.uuid);
                      oldParticipant.status = ParticipantStatus.Connected;
                      oldParticipant.socket = ws;
                      // TODO (#697) group all following calls in one single send
                      // update self to reflect the new-old uuid
                      this.sendParticipants(sender, Reason.Change, MessageType.Self, [ oldParticipant ]);
                      // tell the others that participant rejoined
                      this.broadcastParticipantToOthers(oldGame, Reason.Change, oldParticipant);
                      // send the game data to the participant
                      this.broadcastOthersToParticipant(oldGame, Reason.Init, oldParticipant);
                      this.sendGame(sender, Reason.Init, oldGame);
                      this.sendCards(sender);
                      this.sendEstimations(sender, oldGame.status === GameStatus.Revealed, oldGame.allEstimations());
                    }
                  }
                  break;
                }
                default: {
                  this.sendErrorMessage(sender, ErrorCode.UnknownVerb);
                  console.log('unexpected messagetype');
                }
              } // end switch
            } // end of known uuid
        } catch (err) {
          console.log(`${new Date().toISOString()}: <= ${msg}`);
          console.log(err);
          this.sendException(ws, err.message);
        }
      });
    });

    if (this.pingInterval > 0) {
      setInterval(
        () => {
          console.log(`${new Date().toISOString()}: ping`);
          this.participants.values()
            .filter( participant => participant.status === ParticipantStatus.Connected)
            .forEach( participant => {
              const message: Message = {
                type: MessageType.Ping,
                data: new Date().toISOString(),
                uuid: '',
                reason: Reason.Refresh
              };
              this.sendToParticipant(participant, message);
            });
        },
        this.pingInterval);
    }

    expressWs.app.use('/game', router);
  }
  // </editor-fold>

  // <editor-fold desc='Private broadcast methods'>
  private broadCastAllEstimations(game: Game) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, game.status === GameStatus.Revealed, game.allEstimations()));
  }

  private broadCastClearEstimations(game: Game) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendClearEstimations(participant));
  }

  private broadCastEstimation(game: Game, estimation: Estimation) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, game.status === GameStatus.Revealed, [ estimation ]));
  }

  private broadCastGame(game: Game) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendGame(participant, Reason.Change, game));
  }

  private broadcastParticipantToOthers(game: Game, reason: Reason, participant: Participant): void {
    game
      .filterParticipants(other => other.uuid !== participant.uuid && other.status === ParticipantStatus.Connected)
      .forEach(other => this.sendParticipants(other, reason, MessageType.Participant, [ participant ]) );
  }

  private broadcastOthersToParticipant(game: Game, reason: Reason, participant: Participant): void {
    this.sendParticipants(
      participant,
      reason,
      MessageType.Participant,
      game
        .filterParticipants(other => other.uuid !== participant.uuid));
  }
  // </editor-fold>

  // <editor-fold desc='Private send to participant proxy methods'>
  private sendClearEstimations(to: Participant): void {
    const message: Message = {
      type: MessageType.ClearEstimations,
      data: '',
      uuid: '',
      reason: Reason.Change
    }
    this.sendToParticipant(to, message);
  }

  private sendCards(to: Participant): void {
    const message: Message = {
      type: MessageType.Cards,
      data: this.cardService.generateCardSet(),
      uuid: '',
      reason: Reason.Change
    }
    this.sendToParticipant(to, message);
  }

  private sendErrorMessage(to: Participant, code: ErrorCode, error?: string): void {
    const message: Message = {
      uuid: '',
      type: MessageType.Error,
      data: {
        code,
        error
      },
      reason: Reason.Error
    };
    this.sendToParticipant(to, message);
  }

  private sendEstimations(to: Participant, revealed: boolean, estimations: Array<Estimation>): void {
    const data = estimations.map( estimation => {
      return {
        card: revealed || estimation.uuid === to.uuid ? estimation.card : 0,
        revealed: revealed || estimation.uuid === to.uuid,
        uuid: estimation.uuid
      };
    });

    const message: Message = {
      type: MessageType.Estimation,
      data,
      uuid: '',
      reason: Reason.Change
    };
    this.sendToParticipant(to, message);
  }

  private sendGame(to: Participant, reason: Reason, game: Game): void {
    const message: Message = {
      type: MessageType.Game,
      data: {
        team: game.team,
        status: game.status
      },
      uuid: '',
      reason
    };
    this.sendToParticipant(to, message);
  }

  private sendParticipants(to: Participant, reason: Reason, type: MessageType, participants: Array<Participant>): void {
    const data = participants.map( participant => {
      return {
        status: participant.status,
        nick: participant.nick,
        uuid: participant.uuid,
        role: participant.role
      };
    });

    const message: Message = {
      type: type,
      data,
      uuid: '',
      reason
    };
    this.sendToParticipant(to, message);
  }
  // </editor-fold>

  // <editor-fold desc='Private send to socket methods'>
  private sendException(socket: any, error: string): void {
    const message: Message = {
      uuid: '',
      type: MessageType.Error,
      data: {
        code: ErrorCode.Error,
        error
      },
      reason: Reason.Error
    };
    this.sendToSocket(socket, message);
  }

  private sendParticipantNotFound(socket: any, uuid: string): void {
    const message: Message = {
      uuid: '',
      type: MessageType.Error,
      data: {
        code: ErrorCode.ParticipantNotFound
      },
      reason: Reason.Error
    };
    this.sendToSocket(socket, message);
  }
  // </editor-fold>

  // <editor-fold desc='Private send methods'>
  private sendToParticipant(to: Participant, message: Message) {
    console.log(`${new Date().toISOString()}: => to '${to.nick}': ${MessageType[message.type]} - ${JSON.stringify(message)}`);
    this.send(to.socket, message);
  }

  private sendToSocket(socket: any, message: Message) {
    console.log(`${new Date().toISOString()}: => to socket: ${MessageType[message.type]} - ${JSON.stringify(message)}`);
    this.send(socket, message);
  }

  private send(socket: any, message: Message) {
    // TODO: (#691) check ws status after definition of Socket as class or interface
    try {
      socket.send(JSON.stringify(message));
    } catch (err) {
      console.log(`${new Date().toISOString()}: => error sending: ${err}`);
    }
  }
  // </editor-fold>

  // <editor-fold desc='Private helpers'>
  private getGameOfUuid(uuid: string): Game | undefined {
    const gameName = this.participantGameMap.getValue(uuid);
    return gameName ? this.games.getValue(gameName) : undefined;
  }
  // </editor-fold>
}
