import { Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { v4 as Uuid } from 'uuid';

import {
  ClientMessage, EClientMessageType, IEstimation, IParticipant, EErrorCode, EGameStatus,
  ICreatemessage, IEstimateMessage, IJoinMessage, ILeaveMessage, IRejoinMessage,
  EServerMessageType, EParticipantStatus, ERole, ServerMessage, EMemberStatusChange, IMemberStatusChange
} from '../../../../shared-lib/lib';

import { ICardService } from '../card';
import { IFactoryService } from '../factory.service';
import { ReadyState, WebSocket } from '../websocket';
import { Estimation } from './estimation';
import { ITeam } from './team';
import { Participant } from './participant';

import SERVICETYPES from '../service.types';
import {
  PingMessage, ClearEstimationsMessage, DissolveTeamMessage, ErrorMessage, EstimationListMessage,
  InitMessage, GameStatusMessage, ServerResetMessage, SelfMessage, TeamInfoMessage, MemberChangedMessage
} from '../../messages';

export interface IGameService {
  disconnectParticipant(participantUuid: string): number;
  initializeTeam(expressWS: expressWs.Instance): void;
  reset(): void;
  serializeAllTeams(): string;
  serializeTeam(teamname: string): string;
  serializeParticipants(): string;
  teamExists(uuid: string): boolean;
}

interface ITeamDump {
  team: string;
  status: EGameStatus;
  members: Array<IParticipantDump>;
}

interface IParticipantDump {
  name: string;
  role: ERole;
  status: EParticipantStatus;
  observer: boolean;
  uuid: string;
}

interface IGameServiceDump {
  teams: Array<ITeamDump>;
}

@injectable()
export class GameService implements IGameService {

  //#region Private properties ------------------------------------------------
  private readonly factoryService: IFactoryService;
  private readonly cardService: ICardService
  private readonly participants: Map<string, Participant>;
  private readonly memberTeamMap: Map<string, string>;
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
    this.memberTeamMap = new Map<string, string>();
    this.cnt = 0;
    this.teams = new Map<string, ITeam>();
    this.pingInterval = 0;
  }
  //#endregion

  //#region Interface members -------------------------------------------------
  public teamExists(name: string): boolean {
    return this.teams.has(name);
  }

  public disconnectParticipant(participantUuid: string): number {
    const participant = this.participants.get(participantUuid)
    if (participant) {
      participant.socket.close();
      return 200;
    } else {
      return 404;
    }

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
        ERole.Unknown,
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
          closed.status = EParticipantStatus.Disconnected;
          const team = this.getTeamByParticipantUuid(closed.uuid);
          if (team) {
            console.log('sending disconnection to other participants');
            this.broadcastMemberChange(team, closed, EMemberStatusChange.Disconnected);
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
            console.log(`${new Date().toISOString()}: <= ${EServerMessageType[message.type]}: ${msg}`);
            const preflight = this.preflight(message, req.params.team);
            if (preflight === EErrorCode.ParticipantNotFound) {
              this.sendParticipantNotFound(ws);
            } else if (preflight == EErrorCode.TeamDoesNotExist) {
              this.sendTeamNotFound(ws);
            }
            else {
              // make sure we always have a sender, although preflight has checked this
              const sender = this.getParticipantBySenderUuid(message.senderUuid, ws);
              const auth = this.checkAuthorization(message.type, sender.role);
              if (preflight === EErrorCode.NoError && auth === EErrorCode.NoError) {
                // make sure we always have a game, although preflight has checked this
                const team = this.teams.get(req.params.team) || this.factoryService.dummyGame();
                switch (message.type) {
                  case (EClientMessageType.Create): {
                    this.handleCreate(sender, <ICreatemessage>message);
                    break;
                  }
                  case (EClientMessageType.Estimate): {
                    this.handleEstimate(sender, <IEstimateMessage>message, team);
                    break;
                  }
                  case (EClientMessageType.Join): {
                    this.handleJoin(sender, <IJoinMessage>message, team);
                    break;
                  }
                  case (EClientMessageType.Disconnect): {
                    this.handleKillMe(sender);
                    break;
                  }
                  case (EClientMessageType.Leave): {
                    this.handleLeave(sender, <ILeaveMessage>message, team);
                    break;
                  }
                  // case (EClientMessageType.NickChanged): {
                  //   this.handleNick(sender, <ISetNickMessage>message, team);
                  //   break;
                  // }
                  case (EClientMessageType.Reveal): {
                    this.handleReveal(sender, team);
                    break;
                  }
                  case (EClientMessageType.Start): {
                    this.handleStart(sender, team);
                    break;
                  }
                  case (EClientMessageType.Rejoin): {
                    this.handleRejoin(sender, <IRejoinMessage>message, ws);
                    break;
                  }
                  default: {
                    this.sendErrorMessage(sender, EErrorCode.UnknownVerb);
                    console.log('unexpected messagetype');
                  }
                } // end switch
              } else { // end of preflight = NoError && auth = NoError
                if (preflight !== EErrorCode.NoError) {
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
            .filterParticipants((participant: Participant) => participant.status === EParticipantStatus.Connected)
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
      game.allMembers.forEach((participant: Participant) => this.sendReset(participant));
    }
    this.memberTeamMap.clear();
    this.teams.clear();
  }

   // TODO 2333 create serializer
  public serializeAllTeams(): string {
    const result: IGameServiceDump = {
      teams: new Array<ITeamDump>()
    };

    for (const team of this.teams.values()) {
      const gameDump: ITeamDump = {
        team: team.teamName,
        status: team.status,
        members: new Array<IParticipantDump>()
      }
      team.allMembers.forEach((menber: Participant) => gameDump.members.push({
        name: menber.nick,
        role: menber.role,
        status: menber.status,
        observer: menber.observer,
        uuid: menber.uuid
      }));
      result.teams.push(gameDump);
    }
    return JSON.stringify(result, null, 2);
  }

  public serializeTeam(teamName: string): string {
    const team = this.teams.get(teamName);
    if (team) {
      const gameDump: ITeamDump = {
        team: team.teamName,
        status: team.status,
        members: new Array<IParticipantDump>()
      }
      team.allMembers.forEach((member: Participant) => gameDump.members.push({
        name: member.nick,
        role: member.role,
        status: member.status,
        observer: member.observer,
        uuid: member.uuid
      }));
      return JSON.stringify(gameDump, null, 2);
    }
    else return JSON.stringify({ result: `Team '${teamName}' not found` }, null, 2);
  }

  public serializeParticipants(): string {
    const result = new Array<IParticipantDump>();
    for (const participant of this.participants.values()) {
      result.push({
        name: participant.nick,
        role: participant.role,
        status: participant.status,
        observer: participant.observer,
        uuid: participant.uuid
      })
    }
    return JSON.stringify(result, null, 2);
  }
  //#endregion

  //#region Private message handling methods ----------------------------------
  // TODO 2333 create a handler
  private handleCreate(sender: Participant, message: ICreatemessage): void {
    console.log(`Create: '${sender.nick}' is creating '${message.data.team}'`);
    const newGame = this.factoryService.newTeam(message.data.team);
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    sender.role = ERole.ScrumMaster;
    newGame.upsertMember(sender);
    this.teams.set(message.data.team, newGame);
    this.memberTeamMap.set(message.senderUuid, message.data.team);
    // provide the sender with the current game state
    this.sendTeamInfo(sender, newGame);
  }

  private handleEstimate(sender: Participant, message: IEstimateMessage, team: ITeam): void {
    const estimation = new Estimation(sender.uuid, message.data);
    if (estimation.card >= 0) {
      team.upsertEstimation(estimation);
    }
    else {
      team.deleteEstimation(estimation.uuid);
    }
    this.broadcastEstimation(team, estimation);
  }

  private handleJoin(sender: Participant, message: IJoinMessage, team: ITeam): void {
    console.log(`Join: '${sender.nick}' is joining '${message.data.team}'`);
    sender.role = ERole.Developer;
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    team.upsertMember(sender);
    this.memberTeamMap.set(message.senderUuid, message.data.team);
    // provide the sender with the curren game state
    this.sendTeamInfo(sender, team);
    // tell the others someone joined
    this.broadcastMemberChange(team, sender, EMemberStatusChange.Joined);
  }

  private handleKillMe(sender: Participant): void {
    console.log(`Kill: '${sender.nick}' asked to be disconnected`);
    sender.socket.close();
  }

  private handleLeave(sender: Participant, _message: ILeaveMessage, team: ITeam): void {
    if (sender.role === ERole.ScrumMaster) {
      console.log(`End game: '${sender.nick}' is ending '${team.teamName}'`);
      this.broadcastTeamDissolved(team, sender);
      team
        .filterMembers(_participant => true)
        .forEach(participant => this.memberTeamMap.delete(participant.uuid));
      this.teams.delete(team.teamName);
    } else {
      console.log(`Leave: '${sender.nick}' is leaving '${team.teamName}'`);
      // remove participant from game and dictionaries
      team.removeMember(sender.uuid);
      this.memberTeamMap.delete(sender.uuid);
      this.participants.delete(sender.uuid);
      // tell the others someone left
      sender.status = EParticipantStatus.Left;
      this.broadcastMemberChange(team, sender, EMemberStatusChange.Left);
    }
  }

  // private handleNick(sender: Participant, message: ISetNickMessage, game?: ITeam): void {
  //   console.log(`Nick: '${sender.nick}' => '${message.data}'`);
  //   sender.nick = message.data;
  //   // send the data back as aknowledgment
  //   this.sendSelf(sender);
  //   if (game && this.memberTeamMap.has(sender.uuid)) {
  //     this.broadcastMemberChange(game, sender, EMemberStatusChange.NickChanged);
  //   }
  // }

  private handleReveal(sender: Participant, team: ITeam): void {
    if (sender.role !== ERole.ScrumMaster) {
      this.sendErrorMessage(sender, EErrorCode.ScrumMasterRequired);
    } else {
      team.reveal();
      this.broadcastTeamInfo(team);
      this.broadcastAllEstimations(team);
    }
  }

  private handleStart(sender: Participant, team: ITeam): void {
    if (sender.role !== ERole.ScrumMaster) {
      this.sendErrorMessage(sender, EErrorCode.ScrumMasterRequired);
    } else {
      team.startEstimating();
      this.broadcastClearEstimations(team);
      this.broadcastTeamInfo(team);
    }
  }

  private handleRejoin(sender: Participant, message: IRejoinMessage, ws: any): void {
    console.log(`Rejoin: '${message.senderUuid}' => '${message.data}' `);
    // find the original participant and the game he was in
    const oldParticipant = this.getParticipantBySenderUuid(message.data, sender.socket);
    const teamToRejoin = this.getTeamByParticipantUuid(message.data);

    if (teamToRejoin) {
      // remove the sender
      this.participants.delete(sender.uuid);
      // update the original participant
      oldParticipant.status = EParticipantStatus.Connected;
      oldParticipant.socket = ws;
      // update the sender
      this.sendSelf(oldParticipant);
      // provide the rejoining participant with the curren game state
      this.sendTeamInfo(oldParticipant, teamToRejoin);
      // tell the others that participant rejoined
      this.broadcastMemberChange(teamToRejoin, oldParticipant, EMemberStatusChange.Rejoined);
    }

  }
  //#endregion

  //#region Private broadcast methods -----------------------------------------
  // TODO 2333 create a broadcast service
  private broadcastAllEstimations(team: ITeam) {
    team
      .filterMembers(participant => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, team.status === EGameStatus.Revealed, team.allEstimations));
  }

  private broadcastClearEstimations(team: ITeam) {
    team
      .filterMembers(participant => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.sendClearEstimations(participant));
  }

  private broadcastEstimation(team: ITeam, estimation: Estimation) {
    team
      .filterMembers(participant => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, team.status === EGameStatus.Revealed, [estimation]));
  }

  private broadcastTeamInfo(team: ITeam) {
    team
      .filterMembers(participant => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.sendGameStatus(participant, team));
  }

  private broadcastMemberChange(team: ITeam, changedMember: Participant, change: EMemberStatusChange): void {
    team
      .filterMembers(other => other.uuid !== changedMember.uuid && other.status === EParticipantStatus.Connected)
      .forEach(other => this.sendMemberChange(other, changedMember, change));
  }

  private broadcastTeamDissolved(team: ITeam, participant: Participant): void {
    team
      .filterMembers(other => other.uuid !== participant.uuid && other.status === EParticipantStatus.Connected)
      .forEach(other => this.sendTeamDissolved(other));
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
  // TODO 2333 create a sender service
  private sendClearEstimations(to: Participant): void {
    const message: ServerMessage = new ClearEstimationsMessage();
    this.sendToParticipant(to, message);
  }

  private sendTeamDissolved(to: Participant): void {
    const message: ServerMessage = new DissolveTeamMessage();
    this.sendToParticipant(to, message);
  }

  private sendErrorMessage(to: Participant, code: EErrorCode): void {
    const message: ServerMessage = new ErrorMessage(code);
    this.sendToParticipant(to, message);
  }

  private sendEstimations(to: Participant, revealed: boolean, estimations: Array<Estimation>): void {
    const message: ServerMessage = new EstimationListMessage(this.prepareEstimationsData(to, revealed, estimations));
    this.sendToParticipant(to, message);
  }

  private sendInit(to: Participant): void {
    const message: ServerMessage = new InitMessage(this.prepareParticipantsData([to])[0]);
    this.sendToParticipant(to, message);
  }

  private sendMemberChange(to: Participant, changedMember: Participant, change: EMemberStatusChange) {
    const data: IMemberStatusChange = {
      memberStatusChange: change,
      member: {
        status: changedMember.status,
        nick: changedMember.nick,
        uuid: changedMember.uuid,
        role: changedMember.role,
        observer: changedMember.observer
      }
    }
    const message: ServerMessage = new MemberChangedMessage(data);
    this.sendToParticipant(to, message);
  }

  private sendGameStatus(to: Participant, game: ITeam): void {
    const message: ServerMessage = new GameStatusMessage(game.status);
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

  private sendTeamInfo(to: Participant, game: ITeam): void {
    const message: ServerMessage = new TeamInfoMessage(
      {
        teamName: game.teamName,
        gameStatus: game.status,
        cards: this.cardService.generateCardSet(),
        estimations: this.prepareEstimationsData(to, game.status === EGameStatus.Revealed, game.allEstimations),
        otherMembers: this.prepareParticipantsData(game.filterMembers(other => other.uuid !== to.uuid)),
        self: this.prepareParticipantsData([to])[0]
      });
    this.sendToParticipant(to, message);
  }
  //#endregion

  //#region Private send to socket methods ------------------------------------
  private sendException(socket: WebSocket, errorMessage: string): void {
    const message: ServerMessage = new ErrorMessage(EErrorCode.ServerError, errorMessage);
    this.sendToSocket(socket, message);
  }

  private sendParticipantNotFound(socket: WebSocket): void {
    const message: ServerMessage = new ErrorMessage(EErrorCode.ParticipantNotFound);
    this.sendToSocket(socket, message);
  }

  private sendTeamNotFound(socket: WebSocket): void {
    const message: ServerMessage = new ErrorMessage(EErrorCode.TeamDoesNotExist);
    this.sendToSocket(socket, message);
  }
  //#endregion

  //#region Private send methods ----------------------------------------------
  private sendToParticipant(to: Participant, message: ServerMessage) {
    console.log(`${new Date().toISOString()}: => to '${to.nick}': ${EServerMessageType[message.type]} - ${JSON.stringify(message)}`);
    this.send(to.socket, message);
  }

  private sendToSocket(socket: WebSocket, message: ServerMessage) {
    console.log(`${new Date().toISOString()}: => to socket: ${EServerMessageType[message.type]} - ${JSON.stringify(message)}`);
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
  private checkAuthorization(messageType: EClientMessageType, role: ERole): EErrorCode {
    let result = EErrorCode.NoError;

    switch (messageType) {
      case (EClientMessageType.Estimate): {
        if (role !== ERole.ScrumMaster && role !== ERole.Developer) {
          result = EErrorCode.DeveloperRequired;
        }
        break;
      }
      case (EClientMessageType.Reveal):
      case (EClientMessageType.Start): {
        if (role !== ERole.ScrumMaster) {
          result = EErrorCode.ScrumMasterRequired;
        }
        break;
      }
    }
    return result;
  }

  private getTeamByParticipantUuid(senderUuid: string): ITeam | undefined {
    const gameName = this.memberTeamMap.get(senderUuid);
    return gameName ? this.teams.get(gameName) : undefined;
  }

  public getParticipantBySenderUuid(senderUuid: string, websocket: WebSocket) {
    return this.participants.get(senderUuid) || this.factoryService.dummyParticipant(websocket);
  }

  private messageTypeRequiresTeam(messageType: EClientMessageType): boolean {
    const result =
      messageType === EClientMessageType.Estimate ||
      messageType === EClientMessageType.Join ||
      messageType === EClientMessageType.Leave ||
      messageType === EClientMessageType.Reveal ||
      messageType === EClientMessageType.Start;
    return result;
  }

  private messageTypeRequiresParticipation(messageType: EClientMessageType): boolean {
    const result =
      messageType === EClientMessageType.Estimate ||
      messageType === EClientMessageType.Leave ||
      messageType === EClientMessageType.Reveal ||
      messageType === EClientMessageType.Start;
    return result;
  }

  private messageTypeForbidsParticipation(messageType: EClientMessageType): boolean {
    const result =
      messageType === EClientMessageType.Join ||
      messageType === EClientMessageType.Rejoin;
    return result;
  }

  private preflight(message: ClientMessage, requestTeam: string): EErrorCode {
    let result = EErrorCode.NoError;

    // the sender must exist
    if (!this.participants.has(message.senderUuid)) {
      console.log(`participant with uuid '${message.senderUuid}' not found`);
      result = EErrorCode.ParticipantNotFound;
    }
    else if (message.type === EClientMessageType.Rejoin && !this.teams.has(requestTeam)) {
      console.log(`${EClientMessageType[message.type]}: team '${requestTeam}' does not exist.`);
      result = EErrorCode.TeamDoesNotExist;
    }
    // general tests on team and team participation
    else if (this.messageTypeRequiresTeam(message.type)) {
      if (!this.teams.has(requestTeam)) {
        console.log(`${EClientMessageType[message.type]}: team '${requestTeam}' does not exist.`);
        result = EErrorCode.TeamDoesNotExist;
      } else if (this.messageTypeRequiresParticipation(message.type)) {
        const game = this.getTeamByParticipantUuid(message.senderUuid);
        if (!game) {
          console.log(`${EClientMessageType[message.type]}: '${message.senderUuid}' team '${requestTeam}' does not exist.`);
          result = EErrorCode.TeamDoesNotExist;
        }
        else if (game.teamName !== requestTeam) {
          console.log(`${EClientMessageType[message.type]}: '${message.senderUuid}' does not belong to team '${requestTeam}'.`);
          result = EErrorCode.ParticipantNotInTeam;
        }
      } else if (this.messageTypeForbidsParticipation(message.type)) {
        const game = this.getTeamByParticipantUuid(message.senderUuid);
        if (game) {
          console.log(`${EServerMessageType[message.type]}: '${message.senderUuid}' already belongs to team '${requestTeam}'.`);
          result = EErrorCode.ParticipantAllReadyInTeam;
        }
      }
    }

    // specific cases
    if (result === EErrorCode.NoError) {
      switch (message.type) {
        case (EClientMessageType.Create): {
          if (this.teams.has(requestTeam)) {
            result = EErrorCode.TeamAlreadyExists;
          }
          break;
        }
        case (EClientMessageType.Rejoin): {
          // the old participant must exist
          if (!this.participants.has(<string>message.data)) {
            result = EErrorCode.ParticipantNotFound;
          } else {
            const oldGame = this.getTeamByParticipantUuid(<string>message.data);
            if (!oldGame || oldGame.teamName !== requestTeam) {
              console.log(`${EServerMessageType[message.type]}: '${message.senderUuid}' does not belong to team '${requestTeam}'.`);
              result = EErrorCode.ParticipantNotInTeam;
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
