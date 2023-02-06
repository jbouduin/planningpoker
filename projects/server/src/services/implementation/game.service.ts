import { Router } from 'express';
import * as expressWs from 'express-ws';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import SERVICETYPES from '../service.types';
import STORAGETYPES from '../../storage/storage.types';

import { ClientMessage, EClientMessageType, EErrorCode, EParticipantStatus, EPokerStatus, ERole, ServerMessage } from '../../../../shared-lib/lib';
import { ErrorMessage, PingMessage, ServerResetMessage } from '../../messages';
import { ITeam, LooseObject, Participant } from '../../objects';
import { IFactoryService } from '../factory.service';
import { IGameService, IHandlerService } from '../interfaces';
import { IWebSocket, ReadyState } from '../websocket';
import { IStorageService } from '../../storage/interfaces';

interface ITeamDump {
  team: string;
  status: EPokerStatus;
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
  private readonly handlerService: IHandlerService;
  private readonly storageService: IStorageService;
  private readonly participants: Map<string, Participant>;
  private readonly memberTeamMap: Map<string, string>;
  private cnt: number;
  private teams: Map<string, ITeam>;
  private pingInterval: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.FactoryService) factoryService: IFactoryService,
    @inject(SERVICETYPES.HandlerService) handlerService: IHandlerService,
    @inject(STORAGETYPES.StorageService) storageService: IStorageService) {
    console.log(`${new Date().toISOString()}: gameservice constructor`);
    this.factoryService = factoryService;

    this.handlerService = handlerService;
    this.storageService = storageService;
    this.participants = new Map<string, Participant>();
    this.memberTeamMap = new Map<string, string>();
    this.cnt = 0;
    this.teams = new Map<string, ITeam>();
    this.pingInterval = 0;
  }
  //#endregion

  //#region Interface members -------------------------------------------------
  public canRejoin(teamName: string, uuid: string): string {
    const response: LooseObject = {};
    response.canRejoin = true;
    response.message = null;
    if (!this.storageService.teamExists(teamName)) {
      response.canRejoin = false;
      response.message = 'team does not exist';
    } else if (!this.storageService.participantExists(uuid)) {
      response.canRejoin = false;
      response.message = 'participant does not exist';
    } else if (!this.storageService.participantInTeam(uuid, teamName)) {
      response.canRejoin = false;
      response.message = 'participant is not a teammember';
    }
    return JSON.stringify(response);
  }

  public disconnectParticipant(participantUuid: string): string {
    const participant = this.storageService.getParticipant(participantUuid)
    const response: LooseObject = {}
    if (participant) {
      participant.socket.close();
      response.status = 'ok';
      response.message = 'participant disconnected';
    } else {
      response.status = 'error';
      response.message = 'participant not found';
    }
    return JSON.stringify(response);
  }

  public initializeService(expressWs: expressWs.Instance): void {
    const router = Router();
    const wss = expressWs.getWss();
    wss.on('connection', (ws, req) => {
      const newParticipant = this.handlerService.handleConnect(ws);
      console.log(`${new Date().toISOString()}: connection from client '${req.headers['sec-websocket-key'] || 'unknown'}' registered as '${newParticipant.nick}'`);
      ws.on('close', (_number: number, _reason: Buffer) => {
        this.handlerService.handleClose(ws);
      });
    });

    router.ws(
      '/:team',
      (ws, req, _next) => {
        ws.on('message', (msg: string) => {
          try {
            const message: ClientMessage = JSON.parse(msg);
            console.log(`${new Date().toISOString()}: <= ${message.type}: ${message}`);
            this.handlerService.handleMessage(message, req.params.team, ws);
          } catch (err) {
            this.handlerService.handleError(ws, err);
          }
        });
      });

    if (this.pingInterval > 0) {
      setInterval(() => { this.handlerService.handlePing() }, this.pingInterval);
    }

    expressWs.app.use('/game', router);
  }

  public reset(): string {
    return JSON.stringify(this.handlerService.handleReset());
  }

  // TODO NOW move this to storage service
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

  public getParticipantBySenderUuid(senderUuid: string, websocket: IWebSocket) {
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
      console.log(`${message.type}: team '${requestTeam}' does not exist.`);
      result = EErrorCode.TeamDoesNotExist;
    }
    // general tests on team and team participation
    else if (this.messageTypeRequiresTeam(message.type)) {
      if (!this.teams.has(requestTeam)) {
        console.log(`${message.type}: team '${requestTeam}' does not exist.`);
        result = EErrorCode.TeamDoesNotExist;
      } else if (this.messageTypeRequiresParticipation(message.type)) {
        const game = this.getTeamByParticipantUuid(message.senderUuid);
        if (!game) {
          console.log(`${message.type}: '${message.senderUuid}' team '${requestTeam}' does not exist.`);
          result = EErrorCode.TeamDoesNotExist;
        }
        else if (game.teamName !== requestTeam) {
          console.log(`${message.type}: '${message.senderUuid}' does not belong to team '${requestTeam}'.`);
          result = EErrorCode.ParticipantNotInTeam;
        }
      } else if (this.messageTypeForbidsParticipation(message.type)) {
        const game = this.getTeamByParticipantUuid(message.senderUuid);
        if (game) {
          console.log(`${message.type}: '${message.senderUuid}' already belongs to team '${requestTeam}'.`);
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
              console.log(`${message.type}: '${message.senderUuid}' does not belong to team '${requestTeam}'.`);
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
