import { inject, injectable } from "inversify";

import STORAGETYPES from '../../storage/storage.types';
import SERVICETYPES from "../service.types";

import { AClientMessage, ECardSet, EClientMessageType, EErrorCode, EMemberStatusChange, EParticipantStatus, ERole, IChangeCardSetMessage, IChangeNickMessage, IChangeScrumMasterMessage, ICreatemessage, IEstimateMessage, IJoinMessage, ILeaveMessage, IObserveMessage, IRejoinMessage, IRemoveMessage } from "../../../../shared-lib/lib";
import { Estimation, ITeam, LooseObject, Participant } from "../../objects";
import { IStorageService } from '../../storage/interfaces';
import { ICardService, IHandlerService, ILoggerService, IMessageService } from "../interfaces";
import { IPreflightService } from "../interfaces/preflight.service";
import { IWebSocket } from '../websocket';


@injectable()
export class HandlerService implements IHandlerService{

  //#region Private properties ------------------------------------------------
  private readonly cardService: ICardService;
  private readonly loggerService: ILoggerService;
  private readonly messageService: IMessageService;
  private readonly preflightService: IPreflightService;
  private readonly storage: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.CardService) cardService: ICardService,
    @inject(SERVICETYPES.LoggerService) loggerService: ILoggerService,
    @inject(SERVICETYPES.MessageService) messageService: IMessageService,
    @inject(SERVICETYPES.PreflightService) preflightService: IPreflightService,
    @inject(STORAGETYPES.StorageService) storage: IStorageService) {
    this.cardService = cardService;
    this.loggerService = loggerService;
    this.messageService = messageService;
    this.preflightService = preflightService;
    this.storage = storage;
  }
  //#endregion

  //#region IHandlerService Methods -------------------------------------------
  public handleClose(ws: IWebSocket): void {
    // if an existing connection closes
    // set the connection status to disconnected
    // if the user was in a game: send other participants an update
    const closed = this.storage.filterParticipants((participant: Participant) => participant.socket == ws)[0];
    if (closed) {
      if (closed.status !== EParticipantStatus.Paused) {
        this.loggerService.info('Server', `'${closed.nick}'' has been disconnected`);
        closed.status = EParticipantStatus.Disconnected;
        const team = this.storage.getTeamOfParticipant(closed.uuid);
        if (team) {
          this.loggerService.info('Server', 'sending disconnection to other participants');
          this.messageService.broadcastMemberChange(team, closed, EMemberStatusChange.Disconnected);
          if (closed.role === ERole.ScrumMaster) {
            // assign some random participant the scrum master role
            const connected = team.filterMembers((p: Participant) => p.status === EParticipantStatus.Connected);
            if (connected.length > 0) {
              closed.role = ERole.Developer;
              const newScrumMaster = connected[0];
              newScrumMaster.role = ERole.ScrumMaster;
              this.messageService.broadcastMemberChange(team, newScrumMaster, EMemberStatusChange.ChangedRole);
              this.messageService.sendSelf(newScrumMaster);
            }
          }
        }
      }
    }
  }

  public handleConnect(ws: IWebSocket): Participant {
    const newParticipant = this.storage.createParticipant(ws);
    // send the participant himself back, so he knows his assigned uuid
    this.messageService.sendInit(newParticipant);
    return newParticipant;
  }

  public handleCronTick(maxIdleTime: number): void {
    this.loggerService.info('Server', `Cron tick`);
    for (const team of this.storage.filterTeams((team: ITeam) => team.idleTime > maxIdleTime)) {
      this.loggerService.info('Server', `Cron Tick: deleting '${team.teamName}'`);
      team.allMembers.forEach((participant: Participant) => {
        this.messageService.sendTeamIdleMessage(participant);
        this.storage.deleteParticipant(participant.uuid);
      });
      this.storage.deleteTeam(team.teamName);
    }
  }

  public handleError(ws: IWebSocket, error: Error): void {

      this.loggerService.logError('Server', error)
      this.messageService.sendException(ws, error.message);

  }

  public handleMessage(message: AClientMessage, teamName: string, ws: IWebSocket): void {
    const preflight = this.preflightService.preflight(this.storage, message, teamName);
    if (preflight !== EErrorCode.NoError) {
      this.messageService.sendErrorMessageToSocket(ws, preflight);
    } else {
      const participant = this.storage.getParticipant(message.senderUuid);
      if (participant) {
        this.processMessage(participant, message, teamName, ws)
      }
    }
  }

  public handlePing(): void {
    this.loggerService.info('Server', `ping`);
    this.storage
      .filterParticipants((participant: Participant) => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.messageService.sendPing(participant));
  }

  public handleReset(): LooseObject {
    const response: LooseObject = {};
    response.teams = 0;
    response.totalMembers = 0;
    response.removedTeams = new Array<LooseObject>();
    for (const team of this.storage.filterTeams((_team: ITeam) => true)) {
      const removedTeam: LooseObject = {};
      this.loggerService.info('Server', `System reset: removing '${team.teamName}'`);
      removedTeam.team = team.teamName;
      removedTeam.members = 0;
      removedTeam.removedMembers = new Array<string>();
      team.allMembers.forEach((participant: Participant) => {
        this.messageService.sendReset(participant);
        this.storage.deleteParticipant(participant.uuid);
        removedTeam.removedMembers.push(`${participant.nick} - ${participant.uuid}`);
        response.totalMembers++;
        removedTeam.members++;
      });
      response.removedTeams.push(removedTeam);
      this.storage.deleteTeam(team.teamName);
      response.teams++;
    }
    return response;
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private processMessage(sender: Participant, message: AClientMessage, teamName: string, ws: IWebSocket): void {
    if (message.type === EClientMessageType.Create) {
      this.handleCreate(sender, <ICreatemessage>message);
    }
    else {
      const team = this.storage.getTeam(teamName);
      if (team) {
        switch (message.type) {
          case (EClientMessageType.ChangeCardSet): {
            this.handleChangeCardSet(<IChangeCardSetMessage>message, team);
            break;
          }
          case (EClientMessageType.ChangeNick): {
            this.handleChangeNick(sender, <IChangeNickMessage>message, team);
            break;
          }
          case (EClientMessageType.ChangeScrumMaster): {
            this.handleChangeScrumMaster(sender, <IChangeScrumMasterMessage>message, team);
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
          case (EClientMessageType.Leave): {
            this.handleLeave(sender, <ILeaveMessage>message, team);
            break;
          }
          case (EClientMessageType.Observe): {
            this.handleObserve(<IObserveMessage>message, team);
            break;
          }
          case (EClientMessageType.Pause): {
            this.handlePause(sender, team);
            break;
          }
          case (EClientMessageType.Remove): {
            this.handleRemove(sender, <IRemoveMessage>message, team);
            break;
          }
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
            this.messageService.sendErrorMessageToParticipant(sender, EErrorCode.UnknownVerb);
            this.loggerService.error('Server', 'unexpected messagetype');
          }
        } // end switch
      }
    }
  }

  private handleChangeCardSet(message: IChangeCardSetMessage, team: ITeam): void {
    team.cardSet = message.data;
    this.messageService.broadcastCardSet(team);
  }

  private handleChangeNick(sender: Participant, message: IChangeNickMessage, team: ITeam): void {
    if (sender.nick !== message.data) {
      sender.nick = message.data;
      this.messageService.broadcastMemberChange(team, sender, EMemberStatusChange.ChangedNick);
      this.messageService.sendSelf(sender);
    }
  }

  private handleChangeScrumMaster(sender: Participant, message: IChangeNickMessage, team: ITeam): void {
    if (sender.uuid !== message.data) {
      const newScrumMaster = team.getMember(message.data);
      if (newScrumMaster) {
        sender.role = ERole.Developer;
        newScrumMaster.role = ERole.ScrumMaster;
        this.messageService.broadcastMemberChange(team, sender, EMemberStatusChange.ChangedRole);
        this.messageService.broadcastMemberChange(team, newScrumMaster, EMemberStatusChange.ChangedRole);
        this.messageService.sendSelf(sender);
        this.messageService.sendSelf(newScrumMaster);
      }
      else {
        this.messageService.sendErrorMessageToParticipant(sender, EErrorCode.ParticipantNotFound);
      }
    }
  }

  private handleCreate(sender: Participant, message: ICreatemessage): void {
    this.loggerService.info('Server', `Create: '${sender.nick}' is creating '${message.data.team}'`);
    const newGame = this.storage.createTeam(
      message.data.team,
      message.data.cardSet === ECardSet.Custom ?
        message.data.cards || this.cardService.getCardSet(ECardSet.Cohn) :
        this.cardService.getCardSet(message.data.cardSet));
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    sender.role = ERole.ScrumMaster;
    this.storage.joinTeam(newGame, sender);
    // provide the sender with the current game state
    this.messageService.sendTeamInfo(sender, newGame);
  }

  private handleEstimate(sender: Participant, message: IEstimateMessage, team: ITeam): void {
    const estimation = new Estimation(sender.uuid, message.data);
    if (estimation.card >= 0) {
      team.upsertEstimation(estimation);
    }
    else {
      team.deleteEstimation(estimation.participantUuid);
    }
    this.messageService.broadcastEstimation(team, estimation);
  }

  private handleJoin(sender: Participant, message: IJoinMessage, team: ITeam): void {
    this.loggerService.info('Server', `Join: '${sender.nick}' is joining '${message.data.team}'`);
    sender.role = ERole.Developer;
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    this.storage.joinTeam(team, sender);
    // provide the sender with the curren game state
    this.messageService.sendTeamInfo(sender, team);
    // tell the others someone joined
    this.messageService.broadcastMemberChange(team, sender, EMemberStatusChange.Joined);
  }

  private handleRemove(sender: Participant, message: IRemoveMessage, team: ITeam): void {
    const toRemove = this.storage.getParticipant(message.data);
    if (toRemove) {
      this.storage.leaveTeam(team, toRemove);
      this.storage.deleteParticipant(toRemove.uuid);
      // tell the others someone left
      toRemove.status = EParticipantStatus.Left;
      this.messageService.broadcastMemberChange(team, toRemove, EMemberStatusChange.Left);
    }
  }

  private handleLeave(sender: Participant, message: ILeaveMessage, team: ITeam): void {
    if (sender.role === ERole.ScrumMaster) {
      this.loggerService.info('Server', `End game: '${sender.nick}' is ending '${team.teamName}'`);
      this.messageService.broadcastSessionEnded(team, sender);
      team
        .filterMembers(_participant => true)
        .forEach(participant => this.storage.deleteParticipant(participant.uuid));
      this.storage.deleteTeam(team.teamName);
      // aknowledge to the scrum master
      this.messageService.sendSessionEnded(sender);
      // TODO NOW check if everything is cleaned up at this moment
    } else {
      const leaving = sender.uuid !== message.data ?
        this.storage.getParticipant(message.data) :
        sender;
      if (leaving) {
        this.loggerService.info('Server', `Leave: '${leaving.nick}' is leaving '${team.teamName}'`);
        this.storage.leaveTeam(team, leaving);
        this.storage.deleteParticipant(leaving.uuid);
        // tell the others someone left
        leaving.status = EParticipantStatus.Left;
        this.messageService.broadcastMemberChange(team, leaving, EMemberStatusChange.Left);
        this.messageService.sendLeft(sender);
      }
      if (sender.uuid !== message.data) {
        this.storage.deleteParticipant(sender.uuid);
      }
    }

  }

  private handleObserve(message: IObserveMessage, team: ITeam): void {
    const member = this.storage.getParticipant(message.data.member);
    if (member && member.observer !== message.data.observer) {
      member.observer = message.data.observer;
      this.messageService.broadcastMemberChange(team, member, EMemberStatusChange.Observe);
      this.messageService.sendSelf(member);
    }
  }

  private handlePause(sender: Participant, game: ITeam): void {
    this.loggerService.info('Server', `Pause: '${sender.nick}'`);
    // send the data back as aknowledgment
    sender.status = EParticipantStatus.Paused;
    this.messageService.sendSelf(sender);
    this.messageService.broadcastMemberChange(game, sender, EMemberStatusChange.Paused);
  }

  private handleRejoin(sender: Participant, message: IRejoinMessage, ws: any): void {
    this.loggerService.info('Server', `Rejoin: '${message.senderUuid}' => '${message.data}' `);
    // find the original participant and the game he was in
    const oldParticipant = this.storage.getParticipant(message.data);
    const teamToRejoin = this.storage.getTeamOfParticipant(message.data);

    if (teamToRejoin && oldParticipant) {
      // remove the sender
      this.storage.deleteParticipant(sender.uuid);
      // update the original participant
      oldParticipant.status = EParticipantStatus.Connected;
      oldParticipant.socket = ws;
      // update the sender
      this.messageService.sendSelf(oldParticipant);
      // provide the rejoining participant with the curren game state
      this.messageService.sendTeamInfo(oldParticipant, teamToRejoin);
      // tell the others that participant rejoined
      this.messageService.broadcastMemberChange(teamToRejoin, oldParticipant, EMemberStatusChange.Rejoined);
    }
  }

  private handleReveal(sender: Participant, team: ITeam): void {
    if (sender.role !== ERole.ScrumMaster) {
      this.messageService.sendErrorMessageToParticipant(sender, EErrorCode.ScrumMasterRequired);
    } else {
      team.reveal();
      this.messageService.broadcastPokerStatus(team);
      this.messageService.broadcastAllEstimations(team);
    }
  }

  private handleStart(sender: Participant, team: ITeam): void {
    if (sender.role !== ERole.ScrumMaster) {
      this.messageService.sendErrorMessageToParticipant(sender, EErrorCode.ScrumMasterRequired);
    } else {
      team.startEstimating();
      this.messageService.broadcastClearEstimations(team);
      this.messageService.broadcastPokerStatus(team);
    }
  }
  //#endregion
}