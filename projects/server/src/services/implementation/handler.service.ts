import { inject, injectable } from "inversify";

import STORAGETYPES from '../../storage/storage.types';
import SERVICETYPES from "../service.types";

import { AClientMessage, ECardSet, EClientMessageType, EErrorCode, EMemberChangeType, EParticipantStatus, ERole, IChangeCardSetMessage, IChangeNickMessage, IChangeScrumMasterMessage, ICreatemessage, IEstimateMessage, IEstimation, IJoinMessage, ILeaveMessage, IObserveMessage, IRejoinMessage, IRemoveMessage } from "../../../../shared-lib/src";
import { IServerParticipant, ITeam, LooseObject } from "../../objects";
import { IFactoryService, IStorageService } from '../../storage/interfaces';
import { IHandlerService, ILoggerService, IMessageService } from "../interfaces";
import { IPreflightService } from "../interfaces/preflight.service";
import { IWebSocket } from '../websocket';

@injectable()
export class HandlerService implements IHandlerService {

  //#region Private properties ------------------------------------------------
  private readonly factoryService: IFactoryService;
  private readonly loggerService: ILoggerService;
  private readonly messageService: IMessageService;
  private readonly preflightService: IPreflightService;
  private readonly storage: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.FactoryService) factoryService: IFactoryService,
    @inject(SERVICETYPES.LoggerService) loggerService: ILoggerService,
    @inject(SERVICETYPES.MessageService) messageService: IMessageService,
    @inject(SERVICETYPES.PreflightService) preflightService: IPreflightService,
    @inject(STORAGETYPES.StorageService) storage: IStorageService) {
    this.factoryService = factoryService;
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
    const closed = this.storage.filterParticipants((p: IServerParticipant) => p.socket == ws)[0];
    if (closed) {
      if (closed.status !== EParticipantStatus.Paused) {
        this.loggerService.info('Server', `'${closed.nick}'' has been disconnected`);
        closed.status = EParticipantStatus.Disconnected;
        const team = this.storage.getTeamOfParticipant(closed.participantId);
        if (team) {
          this.loggerService.info('Server', 'sending disconnection to other participants');
          this.messageService.broadcastMemberChange(
            this.storage.getConnectedTeamMembers(team.teamName).filter((p: IServerParticipant) => p.participantId !== closed.participantId),
            closed,
            EMemberChangeType.Disconnected
          );
          if (closed.role === ERole.ScrumMaster) {
            // assign some random participant the scrum master role
            const newScrumMaster = this.storage.getFirstConnectedTeamMember(team.teamName);
            if (newScrumMaster) {
              closed.role = ERole.Developer;
              newScrumMaster.role = ERole.ScrumMaster;
              this.messageService.broadcastMemberChange(
                this.storage.getConnectedTeamMembers(team.teamName).filter((p: IServerParticipant) => p.participantId !== newScrumMaster.participantId),
                newScrumMaster,
                EMemberChangeType.ChangedRole
              );
              this.messageService.sendSelf(newScrumMaster);
            }
          }
        } else {
          this.storage.deleteParticipant(closed.participantId, undefined);
        }
      }
    }
  }

  public handleConnect(ws: IWebSocket): IServerParticipant {
    const newParticipant = this.factoryService.createParticipant(ws);
    this.storage.addParticipant(newParticipant);
    // send the participant himself back, so he knows his assigned participantId
    this.messageService.sendInit(newParticipant);
    return newParticipant;
  }

  public handleCronTick(maxIdleTime: number): void {
    this.loggerService.info('Server', `Cron tick`);
    this.storage
      .filterTeams((team: ITeam) => Date.now() - team.lastAccessTime > maxIdleTime)
      .forEach((team: ITeam) => {
        this.loggerService.info('Server', `Cron Tick: deleting '${team.teamName}'`);
        this.messageService.broadcastTeamIdle(this.storage.getConnectedTeamMembers(team.teamName));
        this.storage.deleteTeam(team.teamName);
      });
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
      const participant = this.storage.getParticipant(message.senderId);
      if (participant) {
        this.processMessage(participant, message, teamName, ws)
      }
    }
  }

  public handlePing(): void {
    this.loggerService.info('Server', `ping`);
    this.storage
      .filterParticipants((participant: IServerParticipant) => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.messageService.sendPing(participant));
  }

  public handleReset(): LooseObject {
    const response: LooseObject = {};
    response.teams = this.storage.allTeams.length;
    response.totalMembers = 0;
    response.removedTeams = new Array<LooseObject>();
    this.storage.allTeams().forEach((team: ITeam) => {
      this.loggerService.info('Server', `System reset: removing '${team.teamName}'`);
      const connectedTeamMembers = this.storage.getConnectedTeamMembers(team.teamName);
      const removedTeam: LooseObject = {};
      removedTeam.team = team.teamName;
      removedTeam.removedMembers = this.storage.deleteTeam(team.teamName).map((p: IServerParticipant) => `${p.nick} - ${p.participantId}`)
      response.totalMembers += removedTeam.removedMembers.length;
      this.messageService.broadcastReset(connectedTeamMembers);
    });
    return response;
  }
  //#endregion

  //#region message handling methods ------------------------------------------
  private processMessage(sender: IServerParticipant, message: AClientMessage, teamName: string, ws: IWebSocket): void {
    if (message.type === EClientMessageType.Create) {
      this.handleCreate(sender, teamName, <ICreatemessage>message);
    }
    else {
      switch (message.type) {
        case (EClientMessageType.ChangeCardSet): {
          this.handleChangeCardSet(teamName, <IChangeCardSetMessage>message);
          break;
        }
        case (EClientMessageType.ChangeNick): {
          this.handleChangeNick(sender, teamName, <IChangeNickMessage>message);
          break;
        }
        case (EClientMessageType.ChangeScrumMaster): {
          this.handleChangeScrumMaster(sender, teamName, <IChangeScrumMasterMessage>message);
          break;
        }
        case (EClientMessageType.Estimate): {
          this.handleEstimate(sender, teamName, <IEstimateMessage>message);
          break;
        }
        case (EClientMessageType.Join): {
          this.handleJoin(sender, teamName, <IJoinMessage>message,);
          break;
        }
        case (EClientMessageType.Leave): {
          this.handleLeave(sender, teamName, <ILeaveMessage>message);
          break;
        }
        case (EClientMessageType.Observe): {
          this.handleObserve(teamName, <IObserveMessage>message);
          break;
        }
        case (EClientMessageType.Pause): {
          this.handlePause(sender, teamName);
          break;
        }
        case (EClientMessageType.Remove): {
          this.handleRemove(teamName, <IRemoveMessage>message);
          break;
        }
        case (EClientMessageType.Reveal): {
          this.handleReveal(teamName);
          break;
        }
        case (EClientMessageType.Start): {
          this.handleStart(teamName);
          break;
        }
        case (EClientMessageType.Rejoin): {
          this.handleRejoin(sender, teamName, <IRejoinMessage>message, ws);
          break;
        }
        // The default (EErrorCode.UnknownVerb) is already handled in preflight
      } // end switch
    }
  }

  private handleChangeCardSet(teamName: string, message: IChangeCardSetMessage): void {
    this.storage.setCardSet(teamName, message.data);
    this.messageService.broadcastCardSet(
      this.storage.getConnectedTeamMembers(teamName),
      message.data);
  }

  private handleChangeNick(sender: IServerParticipant, teamName: string, message: IChangeNickMessage): void {
    if (sender.nick !== message.data) {
      sender.nick = message.data;
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== sender.participantId),
        sender,
        EMemberChangeType.ChangedNick);
      this.messageService.sendSelf(sender);
    }
  }

  private handleChangeScrumMaster(sender: IServerParticipant, teamName: string, message: IChangeNickMessage): void {
    if (sender.participantId !== message.data) {
      const newScrumMaster = this.storage.getParticipant(message.data);
      if (newScrumMaster) {
        sender.role = ERole.Developer;
        newScrumMaster.role = ERole.ScrumMaster;
        this.messageService.broadcastMemberChange(
          this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== sender.participantId),
          sender,
          EMemberChangeType.ChangedRole);
        this.messageService.broadcastMemberChange(
          this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== newScrumMaster.participantId),
          newScrumMaster,
          EMemberChangeType.ChangedRole);
        this.messageService.sendSelf(sender);
        this.messageService.sendSelf(newScrumMaster);
      }
    }
  }

  private handleCreate(sender: IServerParticipant, teamName: string, message: ICreatemessage): void {
    this.loggerService.info('Server', `Create: '${sender.nick}' is creating '${teamName}'`);
    const cardSet = message.data.cardSet === ECardSet.Custom ?
      message.data.cards || this.factoryService.createCardSet(ECardSet.Cohn) :
      this.factoryService.createCardSet(message.data.cardSet);
    // create the team
    const newTeam = this.factoryService.createTeam(teamName);
    this.storage.addTeam(newTeam, cardSet);
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    sender.role = ERole.ScrumMaster;
    // join the team
    this.storage.joinTeam(teamName, sender.participantId);
    // provide the sender with the current game state
    this.messageService.sendAllInfo(
      sender,
      newTeam,
      new Array<IServerParticipant>(),
      cardSet,
      new Array<IEstimation>());
  }

  private handleEstimate(sender: IServerParticipant, teamName: string, message: IEstimateMessage): void {
    let result: IEstimation;
    const team = this.storage.getTeam(teamName);
    if (team) {
      if (message.data) {
        result = this.storage.upsertEstimation(teamName, sender.participantId, message.data);
      }
      else {
        result = this.storage.deleteEstimation(teamName, sender.participantId);
      }
      this.storage
        .getConnectedTeamMembers(teamName)
        .forEach((p: IServerParticipant) => { this.messageService.sendEstimations(p, [result]); });
    }
  }

  private handleJoin(sender: IServerParticipant, teamName: string, message: IJoinMessage): void {
    this.loggerService.info('Server', `Join: '${sender.nick}' is joining '${teamName}'`);
    sender.role = ERole.Developer;
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    const team = this.storage.getTeam(teamName);
    if (team) {
      this.storage.joinTeam(teamName, sender.participantId);
      // provide the sender with the curren game state
      this.messageService.sendAllInfo(
        sender,
        team,
        this.storage.getTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== sender.participantId),
        this.storage.getCardSet(teamName),
        this.storage.getEstimations(teamName)
      );
      // tell the others someone joined
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== sender.participantId),
        sender,
        EMemberChangeType.Joined);
    }
  }

  private handleRemove(teamName: string, message: IRemoveMessage): void {
    const toRemove = this.storage.getParticipant(message.data);
    if (toRemove) {
      this.storage.deleteParticipant(toRemove.participantId, teamName);
      // tell the others someone left
      toRemove.status = EParticipantStatus.Left;
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => toRemove.participantId !== p.participantId),
        toRemove,
        EMemberChangeType.Left);
    }
  }

  private handleLeave(sender: IServerParticipant, teamName: string, message: ILeaveMessage): void {
    if (sender.role === ERole.ScrumMaster) {
      this.loggerService.info('Server', `End game: '${sender.nick}' is ending '${teamName}'`);
      this.messageService.broadcastSessionEnded(this.storage.getConnectedTeamMembers(teamName));
      this.storage.deleteTeam(teamName);

    } else {
      const leaving = sender.participantId !== message.data ?
        this.storage.getParticipant(message.data) :
        sender;
      if (leaving) {
        this.loggerService.info('Server', `Leave: '${leaving.nick}' is leaving '${teamName}'`);
        this.storage.deleteParticipant(leaving.participantId, teamName);
        // tell the others someone left
        leaving.status = EParticipantStatus.Left;
        this.messageService.broadcastMemberChange(
          this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== leaving.participantId),
          leaving,
          EMemberChangeType.Left);
        this.messageService.sendLeft(sender);
      }
      if (sender.participantId !== message.data) {
        this.storage.deleteParticipant(sender.participantId, teamName);
      }
    }
  }

  private handleObserve(teamName: string, message: IObserveMessage): void {
    const member = this.storage.getParticipant(message.data.member);
    if (member && member.observer !== message.data.observer) {
      member.observer = message.data.observer;
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== member.participantId),
        member,
        EMemberChangeType.Observe);
      this.messageService.sendSelf(member);
    }
  }

  private handlePause(sender: IServerParticipant, teamName: string): void {
    this.loggerService.info('Server', `Pause: '${sender.nick}'`);
    // send the data back as aknowledgment
    sender.status = EParticipantStatus.Paused;
    this.messageService.sendSelf(sender);
    this.messageService.broadcastMemberChange(
      this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== sender.participantId),
      sender,
      EMemberChangeType.Paused);
  }

  private handleRejoin(sender: IServerParticipant, teamName: string, message: IRejoinMessage, ws: IWebSocket): void {
    this.loggerService.info('Server', `Rejoin: '${message.senderId}' => '${message.data}' `);
    // find the original participant and the game he was in
    const oldParticipant = this.storage.getParticipant(message.data);
    const team = this.storage.getTeam(teamName);
    if (oldParticipant && team) {
      // remove the sender
      this.storage.deleteParticipant(sender.participantId, teamName);
      // update the original participant
      oldParticipant.status = EParticipantStatus.Connected;
      oldParticipant.socket = ws;
      // provide the rejoining participant with the curren game state
      this.messageService.sendAllInfo(
        oldParticipant,
        team,
        this.storage.getTeamMembers(teamName),
        this.storage.getCardSet(teamName),
        this.storage.getEstimations(teamName)
      );
      const connectedTeamMembers = this.storage
        .getConnectedTeamMembers(teamName)
        .filter((p: IServerParticipant) => p.participantId !== oldParticipant.participantId);
      // if no one else is connected, make this one the new scrum master
      if (connectedTeamMembers.length > 0) {
        // tell the others that participant rejoined
        this.messageService.broadcastMemberChange(
          connectedTeamMembers,
          oldParticipant,
          EMemberChangeType.Rejoined);
      } else if (oldParticipant.role !== ERole.ScrumMaster) {
        oldParticipant.role = ERole.ScrumMaster;
        this.messageService.sendSelf(oldParticipant);
      }

    }
  }

  private handleReveal(teamName: string): void {
    const result = this.storage.reveal(teamName);
    this.messageService.broadcastPokerStatus(
      this.storage.getConnectedTeamMembers(teamName),
      result[0]
    );
    this.storage
      .getConnectedTeamMembers(teamName)
      .forEach((p: IServerParticipant) => { this.messageService.sendEstimations(p, result[1]); });
  }

  private handleStart(teamName: string): void {
    const result = this.storage.startEstimating(teamName);
    this.messageService.broadcastClearEstimations(this.storage.getConnectedTeamMembers(teamName));
    this.messageService.broadcastPokerStatus(
      this.storage.getConnectedTeamMembers(teamName),
      result
    );
  }
  //#endregion
}