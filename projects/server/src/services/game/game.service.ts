import { Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { v4 as Uuid } from 'uuid';

import {
  DtoEstimation,
  DtoGame,
  DtoParticipant, ErrorCode, GameStatus,
  Message,
  MessageType,
  ParticipantStatus,
  Reason,
  Role
} from '../../../../shared-lib/lib';

import { ICardService } from '../card';
import { IFactoryService } from '../factory.service';
import { ReadyState, WebSocket } from '../websocket';
import { Estimation } from './estimation';
import { IGame } from './game';
import { Participant } from './participant';

import SERVICETYPES from '../service.types';

export interface IGameService {
  initializeGame(expressWS: expressWs.Instance): void;
  reset(): void;
  serialize(): string;
  teamExists(uuid: string): boolean;
}

interface IGameDump {
  team: string;
  status: GameStatus;
  participants: Array<IParticipantDump>;
}

interface IParticipantDump {
  name: string;
  role: Role;
  status: ParticipantStatus;
  observer: boolean;
  uuid: string;
}

interface IGameServiceDump {
  games: Array<IGameDump>;
}

@injectable()
export class GameService implements IGameService {

  //#region Private properties ------------------------------------------------
  private readonly factoryService: IFactoryService;
  private readonly cardService: ICardService
  private readonly participants: Map<string, Participant>;
  private readonly participantGameMap: Map<string, string>;
  private cnt: number;
  private games: Map<string, IGame>;
  private pingInterval: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.FactoryService) factoryService: IFactoryService,
    @inject(SERVICETYPES.CardService) cardService: ICardService) {
    console.log(`${new Date().toISOString()}: gameservice constructor`);
    this.factoryService = factoryService;
    this.cardService = cardService;
    this.participants = new Map<string, Participant>();
    this.participantGameMap = new Map<string, string>();
    this.cnt = 0;
    this.games = new Map<string, IGame>();
    this.pingInterval = 0;
  }
  //#endregion

  //#region Interface members -------------------------------------------------
  public teamExists(name: string): boolean {
    return this.games.has(name);
  }

  public initializeGame(expressWs: expressWs.Instance): void {
    const router = Router(); // as expressWs.Router;
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
      this.participants.set(uuid, newParticipant);
      console.log(`${new Date().toISOString()}: connection from client '${req.headers['sec-websocket-key'] || 'unknown'}' entered as '${newParticipant.nick}' in '{TODO (#693) param}'`);
      // send the participant himself back, so he knows his assigned uuid
      this.sendParticipants(newParticipant, Reason.Init, MessageType.Self, [newParticipant]);

      // if an existing connection closes
      // set the connection status to disconnected
      // if the user was in a game: send other participants an update
      ws.on('close', (_number, _reason) => {
        const closed = this.filterParticipants((participant: Participant) => participant.socket == ws)[0];
        if (closed) {
          console.log(`${new Date().toISOString()}: '${closed.nick}'' has been disconnected`);
          closed.status = ParticipantStatus.Disconnected;
          const game = this.getGameOfUuid(closed.uuid);
          if (game) {
            console.log('sending disconnection to other participants');
            this.broadcastParticipantToOthers(game, Reason.Change, closed);
          } else {
            console.log('disconnecting participant was not in a valid game');
          }
        }
        else {
          console.log('disconnecting participant is unknown');
        }
      });
    });

    router.ws(
      '/:team',
      (ws, req, _next) => {
        ws.on('message', (msg: string) => {
          try {
            // parse the message
            const message: Message = JSON.parse(msg);
            console.log(`${new Date().toISOString()}: <= ${MessageType[message.type]}: ${msg}`);

            const preflight = this.preflight(message, req.params.team);
            if (preflight === ErrorCode.ParticipantNotFound) {
              this.sendParticipantNotFound(ws);
            } else if (preflight == ErrorCode.TeamDoesNotExist) {
              this.sendTeamNotFound(ws);
             }
            else {
              // make sure we always have a sender, although preflight has checked this
              const sender = this.getParticipantByUuid(message.uuid, ws);
              const auth = this.checkAuthorization(message.type, sender.role);
              if (preflight === ErrorCode.NoError && auth === ErrorCode.NoError) {
                // make sure we always have a game, although preflight has checked this
                const game = this.games.get(req.params.team) || this.factoryService.dummyGame();
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
                  case (MessageType.Rejoin): {
                    this.handleRejoin(sender, message, ws);
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
            if (err instanceof Error) {
              this.sendException(ws, err.message);
            } else {
              this.sendException(ws, JSON.stringify(err));
            }
          }
        });
      });

    if (this.pingInterval > 0) {
      setInterval(
        () => {
          console.log(`${new Date().toISOString()}: ping`);
          this
            .filterParticipants((participant: Participant) => participant.status === ParticipantStatus.Connected)
            .forEach(participant => {
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

  public reset(): void {
    for (const game of this.games.values()) {
      console.log(`System reaset: Ending game '${game.team}'`);
      game.allParticipants.forEach((participant: Participant) => this.sendEndOfGame(participant, MessageType.Reset));
    }
    this.participantGameMap.clear();
    this.games.clear();
  }

  public serialize(): string {
    const result: IGameServiceDump = {
      games: new Array<IGameDump>()
    };

    for (const game of this.games.values()) {
      const gameDump: IGameDump = {
        team: game.team,
        status: game.status,
        participants: new Array<IParticipantDump>()
      }
      game.allParticipants.forEach((participant: Participant) => gameDump.participants.push({
        name: participant.nick,
        role: participant.role,
        status: participant.status,
        observer: participant.observer,
        uuid: participant.uuid
      }));
      result.games.push(gameDump);
    }
    return JSON.stringify(result, null, 2);
  }
  //#endregion

  //#region Private message handling methods ----------------------------------
  private handleCreate(sender: Participant, message: Message, requestTeam: string): void {
    console.log(`Create: '${sender.nick}' is creating '${(<DtoGame>message.data).team}'`);
    const newGame = this.factoryService.newGame((<DtoGame>message.data).team);
    sender.observer = message.data.observer;
    sender.role = Role.ScrumMaster;
    newGame.upsertParticipant(sender);
    this.games.set(requestTeam, newGame);
    this.participantGameMap.set(message.uuid, requestTeam);
    // provide the sender with the current game state
    this.sendGameState(sender, newGame);
  }

  private handleEstimate(sender: Participant, message: Message, game: IGame): void {
    const estimation = new Estimation(sender.uuid, <number>(message.data));
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
    this.participantGameMap.set(message.uuid, requestTeam);
    // provide the sender with the curren game state
    this.sendGameState(sender, game);
    // tell the others someone joined
    this.broadcastParticipantToOthers(game, Reason.Change, sender);
  }

  private handleKillMe(sender: Participant): void {
    console.log(`Kill: '${sender.nick}' asked to be disconnected`);
    sender.socket.close();
  }

  private handleLeave(sender: Participant, _message: Message, game: IGame): void {
    if (sender.role === Role.ScrumMaster) {
      console.log(`End game: '${sender.nick}' is ending '${game.team}'`);
      this.broadcastEndOfGameToOthers(game, sender);
      game
        .filterParticipants(_participant => true)
        .forEach(participant => this.participantGameMap.delete(participant.uuid));
      this.games.delete(game.team);
    } else {
      console.log(`Leave: '${sender.nick}' is leaving '${game.team}'`);
      // remove participant from game and dictionaries
      game.deleteParticipant(sender.uuid);
      this.participantGameMap.delete(sender.uuid);
      this.participants.delete(sender.uuid);
      // tell the others someone left
      sender.status = ParticipantStatus.Left;
      this.broadcastParticipantToOthers(game, Reason.Change, sender);
    }
  }

  private handleNick(sender: Participant, message: Message, game?: IGame): void {
    console.log(`Nick: '${sender.nick}' => '${(<string>message.data)}'`);
    sender.nick = <string>message.data;
    // send the data back as aknowledgment
    this.sendParticipants(sender, Reason.Change, MessageType.Self, [sender]);
    // check if this user is in a game:
    // depending on the client implementation, it can be that the sender changes his nick before entering a game
    if (game && this.participantGameMap.has(sender.uuid)) {
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

  private handleRejoin(sender: Participant, message: Message, ws: any): void {
    console.log(`Rejoin: '${message.uuid}' => '${(<string>message.data)}' `);
    // find the original participant and the game he was in
    const oldParticipant = this.getParticipantByUuid(<string>message.data, sender.socket);
    const oldGame = this.getGameOfUuid(<string>message.data) || this.factoryService.dummyGame();

    // remove the sender
    this.participants.delete(sender.uuid);
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

  //#region Private broadcast methods -----------------------------------------
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
      .forEach(participant => this.sendEstimations(participant, game.status === GameStatus.Revealed, [estimation]));
  }

  private broadCastGame(game: IGame) {
    game
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendGame(participant, Reason.Change, game));
  }

  private broadcastParticipantToOthers(game: IGame, reason: Reason, participant: Participant): void {
    game
      .filterParticipants(other => other.uuid !== participant.uuid && other.status === ParticipantStatus.Connected)
      .forEach(other => this.sendParticipants(other, reason, MessageType.Participant, [participant]));
  }

  private broadcastEndOfGameToOthers(game: IGame, participant: Participant): void {
    game
      .filterParticipants(other => other.uuid !== participant.uuid && other.status === ParticipantStatus.Connected)
      .forEach(other => this.sendEndOfGame(other, MessageType.EndOfGame));
  }
  //#endregion

  //#region Private prepare message data methods ------------------------------
  private prepareEstimationsData(to: Participant, revealed: boolean, estimations: Array<Estimation>): Array<DtoEstimation> {
    return estimations.map(estimation => {
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
    return participants.map(participant => {
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

  //#region Private send to participant proxy methods -------------------------
  private sendClearEstimations(to: Participant): void {
    const message: Message = {
      type: MessageType.ClearEstimations,
      data: '',
      uuid: '',
      reason: Reason.Change
    }
    this.sendToParticipant(to, message);
  }

  private sendEndOfGame(to: Participant, reason: MessageType): void {
    const message: Message = {
      type: reason,
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
        self: this.prepareParticipantsData([to])
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

  //#region Private send to socket methods ------------------------------------
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

  private sendTeamNotFound(socket: WebSocket): void {
    const message: Message = {
      uuid: '',
      type: MessageType.Error,
      data: {
        code: ErrorCode.TeamDoesNotExist
      },
      reason: Reason.Error
    };
    this.sendToSocket(socket, message);
  }
  //#endregion

  //#region Private send methods ----------------------------------------------
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
      } catch (err: unknown) {
        console.log(`${new Date().toISOString()}: => error sending: ${err}`); // eslint-disable-line
      }
    } else {
      console.log(`Can not send, Readystate is ${ReadyState[socket.readyState]} ${socket.readyState}`);
    }
  }
  //#endregion

  //#region Private helpers ---------------------------------------------------
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
    const gameName = this.participantGameMap.get(uuid);
    return gameName ? this.games.get(gameName) : undefined;
  }

  public getParticipantByUuid(uuid: string, websocket: WebSocket) {
    return this.participants.get(uuid) || this.factoryService.dummyParticipant(websocket);
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
      messageType === MessageType.Rejoin;
    return result;
  }

  private preflight(message: Message, requestTeam: string): ErrorCode {
    let result = ErrorCode.NoError;

    // the sender must exist
    if (!this.participants.has(message.uuid)) {
      console.log(`participant with uuid '${message.uuid}' not found`);
      result = ErrorCode.ParticipantNotFound;
    }
    else if (message.type === MessageType.Rejoin && !this.games.has(requestTeam)) {
      console.log(`${MessageType[message.type]}: team '${requestTeam}' does not exist.`);
      result = ErrorCode.TeamDoesNotExist;
    }
    // general tests on team and team participation
    else if (this.messageTypeRequiresTeam(message.type)) {
      if (!this.games.has(requestTeam)) {
        console.log(`${MessageType[message.type]}: team '${requestTeam}' does not exist.`);
        result = ErrorCode.TeamDoesNotExist;
      } else if (this.messageTypeRequiresParticipation(message.type)) {
        const game = this.getGameOfUuid(message.uuid);
        if (!game) {
          console.log(`${MessageType[message.type]}: '${message.uuid}' team '${requestTeam}' does not exist.`);
          result = ErrorCode.TeamDoesNotExist;
        }
        else if (game.team !== requestTeam) {
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
          if (this.games.has(requestTeam)) {
            result = ErrorCode.TeamAlreadyExists;
          }
          break;
        }
        case (MessageType.Rejoin): {
          // the old participant must exist
          if (!this.participants.has(<string>message.data)) {
            result = ErrorCode.ParticipantNotFound;
          } else {
            const oldGame = this.getGameOfUuid(<string>message.data);
            if (!oldGame || oldGame.team !== requestTeam) {
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

  public filterParticipants(filter: (participant: Participant) => boolean): Array<Participant> {
    const result = new Array<Participant>();
    for (const participant of this.participants.values()) {
      if (filter(participant) === true) {
        result.push(participant);
      }
    }
    return result;
  }
  //#endregion
}
