import { Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { v4 as Uuid } from 'uuid';

import {
  ClientMessage, ClientMessageType, IEstimation, IParticipant, ITeamInfo, ErrorCode, GameStatus,
  ICreatemessage, IEstimateMessage, IJoinMessage, ILeaveMessage, IRejoinMessage,
  ISetNickMessage, ServerMessageType, ParticipantStatus, Role, ServerMessage
} from '../../../../shared-lib/lib';

import { ICardService } from '../card';
import { IFactoryService } from '../factory.service';
import { ReadyState, WebSocket } from '../websocket';
import { Estimation } from './estimation';
import { ITeam } from './team';
import { Participant } from './participant';

import SERVICETYPES from '../service.types';
import {
  PingMessage, ClearEstimationsMessage, EndOfGameMessage, ErrorMessage, EstimationsMessage,
  InitMessage, TeamMessage, ServerResetMessage, SelfMessage, TeamStatusMessage, ParticipantListMessage
} from '../../messages';

export interface IGameService {
  initializeTeam(expressWS: expressWs.Instance): void;
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
  private teams: Map<string, ITeam>;
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
    this.teams = new Map<string, ITeam>();
    this.pingInterval = 0;
  }
  //#endregion

  //#region Interface members -------------------------------------------------
  public teamExists(name: string): boolean {
    return this.teams.has(name);
  }

  public initializeTeam(expressWs: expressWs.Instance): void {
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
      this.sendInit(newParticipant);

      // if an existing connection closes
      // set the connection status to disconnected
      // if the user was in a game: send other participants an update
      ws.on('close', (_number, _reason) => {
        const closed = this.filterParticipants((participant: Participant) => participant.socket == ws)[0];
        if (closed) {
          console.log(`${new Date().toISOString()}: '${closed.nick}'' has been disconnected`);
          closed.status = ParticipantStatus.Disconnected;
          const game = this.getTeamOfSenderUuid(closed.uuid);
          if (game) {
            console.log('sending disconnection to other participants');
            this.broadcastParticipantToOthers(game, closed);
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
            const message: ClientMessage = JSON.parse(msg);
            console.log(`${new Date().toISOString()}: <= ${ServerMessageType[message.type]}: ${msg}`);

            const preflight = this.preflight(message, req.params.team);
            if (preflight === ErrorCode.ParticipantNotFound) {
              this.sendParticipantNotFound(ws);
            } else if (preflight == ErrorCode.TeamDoesNotExist) {
              this.sendTeamNotFound(ws);
            }
            else {
              // make sure we always have a sender, although preflight has checked this
              const sender = this.getParticipantBySenderUuid(message.senderUuid, ws);
              const auth = this.checkAuthorization(message.type, sender.role);
              if (preflight === ErrorCode.NoError && auth === ErrorCode.NoError) {
                // make sure we always have a game, although preflight has checked this
                const team = this.teams.get(req.params.team) || this.factoryService.dummyGame();
                switch (message.type) {
                  case (ClientMessageType.Create): {
                    this.handleCreate(sender, <ICreatemessage>message);
                    break;
                  }
                  case (ClientMessageType.Estimate): {
                    this.handleEstimate(sender, <IEstimateMessage>message, team);
                    break;
                  }
                  case (ClientMessageType.Join): {
                    this.handleJoin(sender, <IJoinMessage>message, team);
                    break;
                  }
                  case (ClientMessageType.KillMe): {
                    this.handleKillMe(sender);
                    break;
                  }
                  case (ClientMessageType.Leave): {
                    this.handleLeave(sender, <ILeaveMessage>message, team);
                    break;
                  }
                  case (ClientMessageType.Nick): {
                    this.handleNick(sender, <ISetNickMessage>message, team);
                    break;
                  }
                  case (ClientMessageType.Reveal): {
                    this.handleReveal(sender, team);
                    break;
                  }
                  case (ClientMessageType.Start): {
                    this.handleStart(sender, team);
                    break;
                  }
                  case (ClientMessageType.Rejoin): {
                    this.handleRejoin(sender, <IRejoinMessage>message, ws);
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
              const message: ServerMessage = new PingMessage();
              this.sendToParticipant(participant, message);
            });
        },
        this.pingInterval);
    }

    expressWs.app.use('/game', router);
  }

  public reset(): void {
    for (const game of this.teams.values()) {
      console.log(`System reset: Ending game '${game.teamName}'`);
      game.allParticipants.forEach((participant: Participant) => this.sendReset(participant));
    }
    this.participantGameMap.clear();
    this.teams.clear();
  }

  public serialize(): string {
    const result: IGameServiceDump = {
      games: new Array<IGameDump>()
    };

    for (const game of this.teams.values()) {
      const gameDump: IGameDump = {
        team: game.teamName,
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
  private handleCreate(sender: Participant, message: ICreatemessage): void {
    console.log(`Create: '${sender.nick}' is creating '${message.data.team}'`);
    const newGame = this.factoryService.newTeam(message.data.team);
    sender.observer = message.data.observer;
    sender.role = Role.ScrumMaster;
    newGame.upsertParticipant(sender);
    this.teams.set(message.data.team, newGame);
    this.participantGameMap.set(message.senderUuid, message.data.team);
    // provide the sender with the current game state
    this.sendStatus(sender, newGame);
  }

  private handleEstimate(sender: Participant, message: IEstimateMessage, team: ITeam): void {
    const estimation = new Estimation(sender.uuid, message.data);
    if (estimation.card >= 0) {
      team.upsertEstimation(estimation);
    }
    else {
      team.deleteEstimation(estimation.uuid);
    }
    this.broadCastEstimation(team, estimation);
  }

  private handleJoin(sender: Participant, message: IJoinMessage, team: ITeam): void {
    console.log(`Join: '${sender.nick}' is joining '${message.data.team}'`);
    sender.role = Role.Developer;
    sender.observer = message.data.observer;
    team.upsertParticipant(sender);
    this.participantGameMap.set(message.senderUuid, message.data.team);
    // provide the sender with the curren game state
    this.sendStatus(sender, team);
    // tell the others someone joined
    this.broadcastParticipantToOthers(team, sender);
  }

  private handleKillMe(sender: Participant): void {
    console.log(`Kill: '${sender.nick}' asked to be disconnected`);
    sender.socket.close();
  }

  private handleLeave(sender: Participant, _message: ILeaveMessage, team: ITeam): void {
    if (sender.role === Role.ScrumMaster) {
      console.log(`End game: '${sender.nick}' is ending '${team.teamName}'`);
      this.broadcastEndOfGameToOthers(team, sender);
      team
        .filterParticipants(_participant => true)
        .forEach(participant => this.participantGameMap.delete(participant.uuid));
      this.teams.delete(team.teamName);
    } else {
      console.log(`Leave: '${sender.nick}' is leaving '${team.teamName}'`);
      // remove participant from game and dictionaries
      team.deleteParticipant(sender.uuid);
      this.participantGameMap.delete(sender.uuid);
      this.participants.delete(sender.uuid);
      // tell the others someone left
      sender.status = ParticipantStatus.Left;
      this.broadcastParticipantToOthers(team, sender);
    }
  }

  private handleNick(sender: Participant, message: ISetNickMessage, game?: ITeam): void {
    console.log(`Nick: '${sender.nick}' => '${message.data}'`);
    sender.nick = message.data;
    // send the data back as aknowledgment
    this.sendSelf(sender);
    // check if this user is in a game:
    // depending on the client implementation, it can be that the sender changes his nick before entering a game
    if (game && this.participantGameMap.has(sender.uuid)) {
      this.broadcastParticipantToOthers(game, sender);
    }
  }

  private handleReveal(sender: Participant, team: ITeam): void {
    if (sender.role !== Role.ScrumMaster) {
      this.sendErrorMessage(sender, ErrorCode.ScrumMasterRequired);
    } else {
      team.reveal();
      this.broadCastGame(team);
      this.broadCastAllEstimations(team);
    }
  }

  private handleStart(sender: Participant, team: ITeam): void {
    if (sender.role !== Role.ScrumMaster) {
      this.sendErrorMessage(sender, ErrorCode.ScrumMasterRequired);
    } else {
      team.startEstimating();
      this.broadCastClearEstimations(team);
      this.broadCastGame(team);
    }
  }

  private handleRejoin(sender: Participant, message: IRejoinMessage, ws: any): void {
    console.log(`Rejoin: '${message.senderUuid}' => '${message.data}' `);
    // find the original participant and the game he was in
    const oldParticipant = this.getParticipantBySenderUuid(message.data, sender.socket);
    const oldGame = this.getTeamOfSenderUuid(message.data) || this.factoryService.dummyGame();

    // remove the sender
    this.participants.delete(sender.uuid);
    // update the original participant
    oldParticipant.uuid = sender.uuid;
    oldParticipant.status = ParticipantStatus.Connected;
    oldParticipant.socket = ws;
    // provide the rejoining participant with the curren game state
    this.sendStatus(oldParticipant, oldGame);
    // tell the others that participant rejoined
    this.broadcastParticipantToOthers(oldGame, oldParticipant);
  }
  //#endregion

  //#region Private broadcast methods -----------------------------------------
  private broadCastAllEstimations(team: ITeam) {
    team
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, team.status === GameStatus.Revealed, team.allEstimations));
  }

  private broadCastClearEstimations(team: ITeam) {
    team
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendClearEstimations(participant));
  }

  private broadCastEstimation(team: ITeam, estimation: Estimation) {
    team
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, team.status === GameStatus.Revealed, [estimation]));
  }

  private broadCastGame(team: ITeam) {
    team
      .filterParticipants(participant => participant.status === ParticipantStatus.Connected)
      .forEach(participant => this.sendTeam(participant, team));
  }

  private broadcastParticipantToOthers(team: ITeam, participant: Participant): void {
    team
      .filterParticipants(other => other.uuid !== participant.uuid && other.status === ParticipantStatus.Connected)
      .forEach(other => this.sendParticipants(other, [participant]));
  }

  private broadcastEndOfGameToOthers(team: ITeam, participant: Participant): void {
    team
      .filterParticipants(other => other.uuid !== participant.uuid && other.status === ParticipantStatus.Connected)
      .forEach(other => this.sendEndOfGame(other));
  }
  //#endregion

  //#region Private prepare message data methods ------------------------------
  private prepareEstimationsData(to: Participant, revealed: boolean, estimations: Array<Estimation>): Array<IEstimation> {
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

  private prepareTeamData(team: ITeam): ITeamInfo {
    return {
      team: team.teamName,
      status: team.status
    };
  }

  private prepareParticipantsData(participants: Array<Participant>): Array<IParticipant> {
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
    const message: ServerMessage = new ClearEstimationsMessage();
    this.sendToParticipant(to, message);
  }

  private sendEndOfGame(to: Participant): void {
    const message: ServerMessage = new EndOfGameMessage();
    this.sendToParticipant(to, message);
  }

  private sendErrorMessage(to: Participant, code: ErrorCode): void {
    const message: ServerMessage = new ErrorMessage(code);
    this.sendToParticipant(to, message);
  }

  private sendEstimations(to: Participant, revealed: boolean, estimations: Array<Estimation>): void {
    const message: ServerMessage = new EstimationsMessage(this.prepareEstimationsData(to, revealed, estimations));
    this.sendToParticipant(to, message);
  }

  private sendInit(to: Participant): void {
    const message: ServerMessage = new InitMessage(this.prepareParticipantsData([to])[0]);
    this.sendToParticipant(to, message);
  }

  private sendTeam(to: Participant, game: ITeam): void {
    const message: ServerMessage = new TeamMessage(this.prepareTeamData(game));
    this.sendToParticipant(to, message);
  }

  private sendReset(to: Participant): void {
    const message: ServerMessage = new ServerResetMessage();
    this.sendToParticipant(to, message);
  }

  private sendSelf(to: Participant): void {
    const message: ServerMessage = new SelfMessage(this.prepareParticipantsData([to])[0]);
    this.sendToParticipant(to, message);
  }

  private sendStatus(to: Participant, game: ITeam): void {
    const message: ServerMessage = new TeamStatusMessage(
      {
        cards: this.cardService.generateCardSet(),
        estimations: this.prepareEstimationsData(to, game.status === GameStatus.Revealed, game.allEstimations),
        game: this.prepareTeamData(game),
        others: this.prepareParticipantsData(game.filterParticipants(other => other.uuid !== to.uuid)),
        self: this.prepareParticipantsData([to])[0]
      });
    this.sendToParticipant(to, message);
  }

  private sendParticipants(to: Participant, participants: Array<Participant>): void {
    const message: ServerMessage = new ParticipantListMessage(this.prepareParticipantsData(participants));
    this.sendToParticipant(to, message);
  }
  //#endregion

  //#region Private send to socket methods ------------------------------------
  private sendException(socket: WebSocket, errorMessage: string): void {
    const message: ServerMessage = new ErrorMessage(ErrorCode.ServerError, errorMessage);
    this.sendToSocket(socket, message);
  }

  private sendParticipantNotFound(socket: WebSocket): void {
    const message: ServerMessage = new ErrorMessage(ErrorCode.ParticipantNotFound);
    this.sendToSocket(socket, message);
  }

  private sendTeamNotFound(socket: WebSocket): void {
    const message: ServerMessage = new ErrorMessage(ErrorCode.TeamDoesNotExist);
    this.sendToSocket(socket, message);
  }
  //#endregion

  //#region Private send methods ----------------------------------------------
  private sendToParticipant(to: Participant, message: ServerMessage) {
    console.log(`${new Date().toISOString()}: => to '${to.nick}': ${ServerMessageType[message.type]} - ${JSON.stringify(message)}`);
    this.send(to.socket, message);
  }

  private sendToSocket(socket: WebSocket, message: ServerMessage) {
    console.log(`${new Date().toISOString()}: => to socket: ${ServerMessageType[message.type]} - ${JSON.stringify(message)}`);
    this.send(socket, message);
  }

  private send(socket: WebSocket, message: ServerMessage) {
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
  private checkAuthorization(messageType: ClientMessageType, role: Role): ErrorCode {
    let result = ErrorCode.NoError;

    switch (messageType) {
      case (ClientMessageType.Estimate): {
        if (role !== Role.ScrumMaster && role !== Role.Developer) {
          result = ErrorCode.DeveloperRequired;
        }
        break;
      }
      case (ClientMessageType.Reveal):
      case (ClientMessageType.Start): {
        if (role !== Role.ScrumMaster) {
          result = ErrorCode.ScrumMasterRequired;
        }
        break;
      }
    }
    return result;
  }

  private getTeamOfSenderUuid(senderUuid: string): ITeam | undefined {
    const gameName = this.participantGameMap.get(senderUuid);
    return gameName ? this.teams.get(gameName) : undefined;
  }

  public getParticipantBySenderUuid(senderUuid: string, websocket: WebSocket) {
    return this.participants.get(senderUuid) || this.factoryService.dummyParticipant(websocket);
  }

  private messageTypeRequiresTeam(messageType: ClientMessageType): boolean {
    const result =
      messageType === ClientMessageType.Estimate ||
      messageType === ClientMessageType.Join ||
      messageType === ClientMessageType.Leave ||
      messageType === ClientMessageType.Reveal ||
      messageType === ClientMessageType.Start;
    return result;
  }

  private messageTypeRequiresParticipation(messageType: ClientMessageType): boolean {
    const result =
      messageType === ClientMessageType.Estimate ||
      messageType === ClientMessageType.Leave ||
      messageType === ClientMessageType.Reveal ||
      messageType === ClientMessageType.Start;
    return result;
  }

  private messageTypeForbidsParticipation(messageType: ClientMessageType): boolean {
    const result =
      messageType === ClientMessageType.Join ||
      messageType === ClientMessageType.Rejoin;
    return result;
  }

  private preflight(message: ClientMessage, requestTeam: string): ErrorCode {
    let result = ErrorCode.NoError;

    // the sender must exist
    if (!this.participants.has(message.senderUuid)) {
      console.log(`participant with uuid '${message.senderUuid}' not found`);
      result = ErrorCode.ParticipantNotFound;
    }
    else if (message.type === ClientMessageType.Rejoin && !this.teams.has(requestTeam)) {
      console.log(`${ClientMessageType[message.type]}: team '${requestTeam}' does not exist.`);
      result = ErrorCode.TeamDoesNotExist;
    }
    // general tests on team and team participation
    else if (this.messageTypeRequiresTeam(message.type)) {
      if (!this.teams.has(requestTeam)) {
        console.log(`${ClientMessageType[message.type]}: team '${requestTeam}' does not exist.`);
        result = ErrorCode.TeamDoesNotExist;
      } else if (this.messageTypeRequiresParticipation(message.type)) {
        const game = this.getTeamOfSenderUuid(message.senderUuid);
        if (!game) {
          console.log(`${ClientMessageType[message.type]}: '${message.senderUuid}' team '${requestTeam}' does not exist.`);
          result = ErrorCode.TeamDoesNotExist;
        }
        else if (game.teamName !== requestTeam) {
          console.log(`${ClientMessageType[message.type]}: '${message.senderUuid}' does not belong to team '${requestTeam}'.`);
          result = ErrorCode.ParticipantNotInTeam;
        }
      } else if (this.messageTypeForbidsParticipation(message.type)) {
        const game = this.getTeamOfSenderUuid(message.senderUuid);
        if (game) {
          console.log(`${ServerMessageType[message.type]}: '${message.senderUuid}' already belongs to team '${requestTeam}'.`);
          result = ErrorCode.ParticipantAllReadyInTeam;
        }
      }
    }

    // specific cases
    if (result === ErrorCode.NoError) {
      switch (message.type) {
        case (ClientMessageType.Create): {
          if (this.teams.has(requestTeam)) {
            result = ErrorCode.TeamAlreadyExists;
          }
          break;
        }
        case (ClientMessageType.Rejoin): {
          // the old participant must exist
          if (!this.participants.has(<string>message.data)) {
            result = ErrorCode.ParticipantNotFound;
          } else {
            const oldGame = this.getTeamOfSenderUuid(<string>message.data);
            if (!oldGame || oldGame.teamName !== requestTeam) {
              console.log(`${ServerMessageType[message.type]}: '${message.senderUuid}' does not belong to team '${requestTeam}'.`);
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
