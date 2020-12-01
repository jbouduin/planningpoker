import { Application, Request, Response, Router } from 'express';
import * as expressWs from 'express-ws';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';
import * as ws from 'ws';

import {
  ErrorCode,
  DtoEstimation,
  DtoGame,
  DtoParticipant,
  GameStatus,
  Message,
  MessageType,
  ParticipantStatus,
  Reason,
  Role
} from '../../../../shared-lib/lib';

import { IFactoryService } from '../factory.service';
import { ICardService } from '../card';
import { ReadyState, WebSocket } from '../websocket';
import { Estimation } from './estimation';
import { IGame } from './game';
import { Participant } from './participant';

import SERVICETYPES from '../service.types';

export interface IGameService {
  initializeGame(expressWS: expressWs.Instance): void;
}

@injectable()
export class GameService implements IGameService {

  //#region  Private properties
  private cnt: number;
  private games: Collections.Dictionary<string, IGame>;
  private participants: Collections.Dictionary<string, Participant>;
  private participantGameMap: Collections.Dictionary<string, string>;
  private pingInterval: number;
  //#endregion

  //#region  Constructor & C°
  public constructor(
    @inject(SERVICETYPES.FactoryService) private factoryService: IFactoryService,
    @inject(SERVICETYPES.CardService) private cardService: ICardService) {
    console.log(`${new Date().toISOString()}: gameservice constructor`);
    this.cnt = 0;
    this.games = new Collections.Dictionary<string, IGame>();
    this.participants = new Collections.Dictionary<string, Participant>();
    this.participantGameMap = new Collections.Dictionary<string, string>();
    this.pingInterval = 0;
  }
  //#endregion

  //#region  Interface members
  public initializeGame(expressWs: expressWs.Instance): void {
    const router = Router() as expressWs.Router;
    const wss = expressWs.getWss();
    wss.on('connection', (ws, req) => {
      // new connection:
      // store in the participants collection
      // assign it an uuid and send the participant back to the sender
      // TODO: (#693) const param = req['params'] ? req['params'].team : 'not specified';
      const uuid = Uuid();
      const newParticipant = this.factoryService.newParticipant(
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
            console.log(`${new Date().toISOString()}: <= ${MessageType[message.type]}: ${msg}`);

            const preflight = this.preflight(message, req.params.team);
            if (preflight === ErrorCode.ParticipantNotFound) {
              this.sendParticipantNotFound(ws);
            } else {
              // make sure we always have a sender, although preflight has checked this
              const sender = this.getParticipantByUuid(message.uuid, ws);
              const auth = this.checkAuthorization(message.type, sender.role);
              if (preflight === ErrorCode.NoError && auth === ErrorCode.NoError) {
                // make sure we always have a game, although preflight has checked this
                const game = this.games.getValue(req.params.team) || this.factoryService.dummyGame();
                switch (message.type) {
                  case (MessageType.Create): {
                    this.handleCreate(sender, message, req.params.team);
                    break;
                  }
                  case (MessageType.Estimate): {
                    this.handleEstimate(sender, message, game);
                    break;
                  }
                  case (MessageType.Join): {
                    this.handleJoin(sender, message, game, req.params.team);
                    break;
                  }
                  case (MessageType.KillMe): {
                    this.handleKillMe(sender);
                    break;
                  }
                  case (MessageType.Leave): {
                    this.handleLeave(sender, message, game);
                    break;
                  }
                  case (MessageType.Nick): {
                    this.handleNick(sender, message, game);
                    break;
                  }
                  case (MessageType.Reveal): {
                    this.handleReveal(sender, message, game);
                    break;
                  }
                  case (MessageType.Start): {
                    this.handleStart(sender, message, game);
                    break;
                  }
                  case (MessageType.Switch): {
                    this.handleSwitch(sender, message, ws);
                    break;
                  }
                  default: {
                    this.sendErrorMessage(sender, ErrorCode.UnknownVerb);
                    console.log('unexpected messagetype');
                  }
                } // end switch
              } else { // end of preflight = NoError && auth = NoError
                if (preflight !== ErrorCode.NoError) {
                  this.sendErrorMessage(sender, preflight);
                } else {
                  this.sendErrorMessage(sender, auth);
                }
              }
            } // end of else preflight != ParticipantNotFound
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
  //#endregion

  //#region  Private message handling methods
  private handleCreate(sender: Participant, message: Message, requestTeam: string): void {
    console.log(`Create: '${sender.nick}' is creating '${message.data.team}'`);
    const newGame = this.factoryService.newGame(message.data.team);
    sender.observer = message.data.observer;
    sender.role = Role.ScrumMaster;
    newGame.upsertParticipant(sender);
    this.games.setValue(requestTeam, newGame);
    this.participantGameMap.setValue(message.uuid, requestTeam);
    // provide the sender with the current game state
    this.sendGameState(sender, newGame);
  }

  private handleEstimate(sender: Participant, message: Message, game: IGame): void {
    const estimation = new Estimation(sender.uuid, message.data);
    if (estimation.card >= 0) {
      game.upsertEstimation(estimation);
    }
    else {
      game.deleteEstimation(estimation.uuid);
    }
    this.broadCastEstimation(game, estimation);
  }

  private handleJoin(sender: Participant, message: Message, game: IGame, requestTeam: string): void {
    console.log(`Join: '${sender.nick}' is joining '${game.team}'`);
    sender.role = Role.Developer;
    sender.observer = message.data.observer;
    game.upsertParticipant(sender);
    this.participantGameMap.setValue(message.uuid, requestTeam);
    // provide the sender with the curren game state
    this.sendGameState(sender, game);
    // tell the others someone joined
    this.broadcastParticipantToOthers(game, Reason.Change, sender);
  }

  private handleKillMe(sender: Participant): void {
    console.log(`Kill: '${sender.nick}' asked to be disconnected`);
    sender.socket.close();
  }

  private handleLeave(sender: Participant, message: Message, game: IGame): void {
    if (sender.role === Role.ScrumMaster) {
      console.log(`End game: '${sender.nick}' is ending '${game.team}'`);
      this.broadcastEndOfGameToOthers(game, sender);
      game
        .filterParticipants(participant => true)
        .forEach(participant => this.participantGameMap.remove(participant.uuid));
      this.games.remove(game.team);
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
  }

  private handleNick(sender: Participant, message: Message, game?: IGame): void {
    console.log(`Nick: '${sender.nick}' => '${message.data}'`);
    sender.nick = message.data;
    // send the data back as aknowledgment
    this.sendParticipants(sender, Reason.Change, MessageType.Self, [ sender ]);
    // check if this user is in a game:
    // depending on the client implementation, it can be that the sender changes his nick before entering a game
    if (game && this.participantGameMap.containsKey(sender.uuid)) {
      this.broadcastParticipantToOthers(game, Reason.Change, sender);
    }
  }

  private handleReveal(sender: Participant, message: Message, game: IGame): void {
    if (sender.role !== Role.ScrumMaster) {
      this.sendErrorMessage(sender, ErrorCode.ScrumMasterRequired);
    } else {
      game.reveal();
      this.broadCastGame(game);
      this.broadCastAllEstimations(game);
    }
  }

  private handleStart(sender: Participant, message: Message, game: IGame): void {
    if (sender.role !== Role.ScrumMaster) {
      this.sendErrorMessage(sender, ErrorCode.ScrumMasterRequired);
    } else {
      game.startEstimating();
      this.broadCastClearEstimations(game);
      this.broadCastGame(game);
    }
  }

  private handleSwitch(sender: Participant, message: Message, ws: any): void {
    console.log(`Switch: '${message.uuid}' => '${message.data}' `);
    // find the original participant and the game he was in
    const oldParticipant = this.getParticipantByUuid(message.data, sender.socket);
    const oldGame = this.getGameOfUuid(message.data) || this.factoryService.dummyGame();

    // remove the sender
    this.participants.remove(sender.uuid);
    // update the original participant
    oldParticipant.uuid = sender.uuid;
    oldParticipant.status = ParticipantStatus.Connected;
    oldParticipant.socket = ws;
    // provide the rejoining participant with the curren game state
    this.sendGameState(oldParticipant, oldGame);
    // tell the others that participant rejoined
    this.broadcastParticipantToOthers(oldGame, Reason.Change, oldParticipant);
  }
  //#endregion

  //#region  Private broadcast methods
  private broadCastAllEstimations(game: IGame) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, game.status === GameStatus.Revealed, game.allEstimations));
  }

  private broadCastClearEstimations(game: IGame) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendClearEstimations(participant));
  }

  private broadCastEstimation(game: IGame, estimation: Estimation) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, game.status === GameStatus.Revealed, [ estimation ]));
  }

  private broadCastGame(game: IGame) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendGame(participant, Reason.Change, game));
  }

  private broadcastParticipantToOthers(game: IGame, reason: Reason, participant: Participant): void {
    game
      .filterParticipants(other => other.uuid !== participant.uuid && other.status === ParticipantStatus.Connected)
      .forEach(other => this.sendParticipants(other, reason, MessageType.Participant, [ participant ]) );
  }

  private broadcastEndOfGameToOthers(game: IGame, participant: Participant): void {
    game
      .filterParticipants(other => other.uuid !== participant.uuid && other.status === ParticipantStatus.Connected)
      .forEach(other => this.sendEndOfGame(other));
  }
  //#endregion

  //#region  Private prepare message data methods
  private prepareEstimationsData(to: Participant, revealed: boolean, estimations: Array<Estimation>): Array<DtoEstimation> {
    return estimations.map( estimation => {
      return {
        card: estimation.card < 0 ?
          estimation.card :
          revealed || estimation.uuid === to.uuid ? estimation.card : 0,
        revealed: revealed || estimation.uuid === to.uuid,
        uuid: estimation.uuid
      };
    });
  }

  private prepareGameData(game: IGame): DtoGame {
    return {
      team: game.team,
      status: game.status
    };
  }

  private prepareParticipantsData(participants: Array<Participant>): Array<DtoParticipant> {
    return participants.map( participant => {
      return {
        status: participant.status,
        nick: participant.nick,
        uuid: participant.uuid,
        role: participant.role,
        observer: participant.observer
      };
    });
  }
  //#endregion

  //#region  Private send to participant proxy methods
  private sendClearEstimations(to: Participant): void {
    const message: Message = {
      type: MessageType.ClearEstimations,
      data: '',
      uuid: '',
      reason: Reason.Change
    }
    this.sendToParticipant(to, message);
  }

  private sendEndOfGame(to: Participant): void {
    const message: Message = {
      type: MessageType.EndOfGame,
      data: '',
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
    const message: Message = {
      type: MessageType.Estimation,
      data: this.prepareEstimationsData(to, revealed, estimations),
      uuid: '',
      reason: Reason.Change
    };
    this.sendToParticipant(to, message);
  }

  private sendGame(to: Participant, reason: Reason, game: IGame): void {
    const message: Message = {
      type: MessageType.Game,
      data: this.prepareGameData(game),
      uuid: '',
      reason
    };
    this.sendToParticipant(to, message);
  }

  private sendGameState(to: Participant, game: IGame): void {
    const message: Message = {
      uuid: '',
      type: MessageType.State,
      data: {
        cards: this.cardService.generateCardSet(),
        estimations: this.prepareEstimationsData(to, game.status === GameStatus.Revealed, game.allEstimations),
        game: this.prepareGameData(game),
        others: this.prepareParticipantsData(game.filterParticipants(other => other.uuid !== to.uuid)),
        self: this.prepareParticipantsData([ to ])
      },
      reason: Reason.Refresh
    };
    this.sendToParticipant(to, message);
  }

  private sendParticipants(to: Participant, reason: Reason, type: MessageType, participants: Array<Participant>): void {
    const message: Message = {
      type: type,
      data: this.prepareParticipantsData(participants),
      uuid: '',
      reason
    };
    this.sendToParticipant(to, message);
  }
  //#endregion

  //#region  Private send to socket methods
  private sendException(socket: WebSocket, error: string): void {
    const message: Message = {
      uuid: '',
      type: MessageType.Error,
      data: {
        code: ErrorCode.ServerError,
        error
      },
      reason: Reason.Error
    };
    this.sendToSocket(socket, message);
  }

  private sendParticipantNotFound(socket: WebSocket): void {
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
  //#endregion

  //#region  Private send methods
  private sendToParticipant(to: Participant, message: Message) {
    console.log(`${new Date().toISOString()}: => to '${to.nick}': ${MessageType[message.type]} - ${JSON.stringify(message)}`);
    this.send(to.socket, message);
  }

  private sendToSocket(socket: WebSocket, message: Message) {
    console.log(`${new Date().toISOString()}: => to socket: ${MessageType[message.type]} - ${JSON.stringify(message)}`);
    this.send(socket, message);
  }

  private send(socket: WebSocket, message: Message) {
    if (socket.readyState === ReadyState.OPEN) {
      try {
        socket.send(JSON.stringify(message));
      } catch (err) {
        console.log(`${new Date().toISOString()}: => error sending: ${err}`);
      }
    } else {
      console.log(`Can not send, Readystate is ${ReadyState[socket.readyState]} ${socket.readyState}`);
    }
  }
  //#endregion

  //#region  Private helpers
  private checkAuthorization(messageType: MessageType, role: Role): ErrorCode {
    let result = ErrorCode.NoError;

    switch (messageType) {
      case (MessageType.Estimate): {
        if (role !== Role.ScrumMaster && role !== Role.Developer) {
          result = ErrorCode.DeveloperRequired;
        }
        break;
      }
      case (MessageType.Reveal):
      case (MessageType.Start): {
        if (role !== Role.ScrumMaster) {
          result = ErrorCode.ScrumMasterRequired;
        }
        break;
      }
    }
    return result;
  }

  private getGameOfUuid(uuid: string): IGame | undefined {
    const gameName = this.participantGameMap.getValue(uuid);
    return gameName ? this.games.getValue(gameName) : undefined;
  }

  public getParticipantByUuid(uuid: string, websocket: WebSocket) {
    return this.participants.getValue(uuid) || this.factoryService.dummyParticipant(websocket);
  }

  private messageTypeRequiresTeam(messageType: MessageType): boolean {
    const result =
      messageType === MessageType.Estimate ||
      messageType === MessageType.Join ||
      messageType === MessageType.Leave ||
      messageType === MessageType.Reveal ||
      messageType === MessageType.Start;
    return result;
  }

  private messageTypeRequiresParticipation(messageType: MessageType): boolean {
    const result =
      messageType === MessageType.Estimate ||
      messageType === MessageType.Leave ||
      messageType === MessageType.Reveal ||
      messageType === MessageType.Start;
    return result;
  }

  private messageTypeForbidsParticipation(messageType: MessageType): boolean {
    const result =
      messageType === MessageType.Join ||
      messageType === MessageType.Switch;
    return result;
  }

  private preflight(message: Message, requestTeam: string): ErrorCode {
    let result = ErrorCode.NoError;

    // the sender must exist
    if (!this.participants.containsKey(message.uuid)) {
      console.log(`participant with uuid '${message.uuid}' not found`);
      result = ErrorCode.ParticipantNotFound;
    }
    // general tests on team and team participation
    else if (this.messageTypeRequiresTeam(message.type)) {
      if (!this.games.containsKey(requestTeam)) {
        console.log(`${MessageType[message.type]}: team '${requestTeam}' does not exist.`);
        result = ErrorCode.TeamDoesNotExist;
      } else if (this.messageTypeRequiresParticipation(message.type)) {
        const game = this.getGameOfUuid(message.uuid);
        if (! game || game.team !== requestTeam) {
          console.log(`${MessageType[message.type]}: '${message.uuid}' does not belong to team '${requestTeam}'.`);
          result = ErrorCode.ParticipantNotInTeam;
        }
      } else if (this.messageTypeForbidsParticipation(message.type)) {
        const game = this.getGameOfUuid(message.uuid);
        if (game) {
          console.log(`${MessageType[message.type]}: '${message.uuid}' already belongs to team '${requestTeam}'.`);
          result = ErrorCode.ParticipantAllReadyInTeam;
        }
      }
    }

    // specific cases
    if (result === ErrorCode.NoError) {
      switch (message.type) {
        case (MessageType.Create): {
          if (this.games.containsKey
            (requestTeam)) {
            result = ErrorCode.TeamAlreadyExists;
          }
          break;
        }
        case (MessageType.Switch): {
          // the old participant must exist
          if (!this.participants.containsKey(message.data)) {
            result = ErrorCode.ParticipantNotFound;
          } else {
            const oldGame = this.getGameOfUuid(message.data);
            if (! oldGame || oldGame.team !== requestTeam) {
              console.log(`${MessageType[message.type]}: '${message.uuid}' does not belong to team '${requestTeam}'.`);
              result = ErrorCode.ParticipantNotInTeam;
            }
          }
          break;
        }
      }
    }
    return result;
  }
  //#endregion
}
