import { inject, injectable } from "inversify";

import STORAGETYPES from '../../storage/storage.types';
import SERVICETYPES from "../service.types";

import { AClientMessage, ECardSet, EClientMessageType, EErrorCode, EMemberStatusChange, EParticipantStatus, EPokerStatus, ERole, IChangeCardSetMessage, IChangeNickMessage, IChangeScrumMasterMessage, ICreatemessage, IEstimateMessage, IEstimation, IJoinMessage, ILeaveMessage, IObserveMessage, IRejoinMessage, IRemoveMessage } from "../../../../shared-lib/src";
import { IServerParticipant, ITeam, LooseObject } from "../../objects";
import { IStorageService } from '../../storage/interfaces';
import { ICardService, IHandlerService, ILoggerService, IMessageService } from "../interfaces";
import { IPreflightService } from "../interfaces/preflight.service";
import { IWebSocket } from '../websocket';


@injectable()
export class HandlerService implements IHandlerService {

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
            EMemberStatusChange.Disconnected
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
                EMemberStatusChange.ChangedRole
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
    const newParticipant = this.storage.createParticipant(ws);
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
      this.handleCreate(sender, <ICreatemessage>message);
    }
    else {
      switch (message.type) {
        case (EClientMessageType.ChangeCardSet): {
          this.handleChangeCardSet(<IChangeCardSetMessage>message, teamName);
          break;
        }
        case (EClientMessageType.ChangeNick): {
          this.handleChangeNick(sender, <IChangeNickMessage>message, teamName);
          break;
        }
        case (EClientMessageType.ChangeScrumMaster): {
          this.handleChangeScrumMaster(sender, <IChangeScrumMasterMessage>message, teamName);
          break;
        }
        case (EClientMessageType.Estimate): {
          this.handleEstimate(sender, <IEstimateMessage>message, teamName);
          break;
        }
        case (EClientMessageType.Join): {
          this.handleJoin(sender, <IJoinMessage>message, teamName);
          break;
        }
        case (EClientMessageType.Leave): {
          this.handleLeave(sender, <ILeaveMessage>message, teamName);
          break;
        }
        case (EClientMessageType.Observe): {
          this.handleObserve(<IObserveMessage>message, teamName);
          break;
        }
        case (EClientMessageType.Pause): {
          this.handlePause(sender, teamName);
          break;
        }
        case (EClientMessageType.Remove): {
          this.handleRemove(<IRemoveMessage>message, teamName);
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
          this.handleRejoin(sender, <IRejoinMessage>message, teamName, ws);
          break;
        }
        default: {
          this.messageService.sendErrorMessageToParticipant(sender, EErrorCode.UnknownVerb);
          this.loggerService.error('Server', 'unexpected messagetype');
        }
      } // end switch
    }
  }

  private handleChangeCardSet(message: IChangeCardSetMessage, teamName: string): void {
    this.storage.setCardSet(teamName, message.data);
    this.messageService.broadcastCardSet(
      this.storage.getConnectedTeamMembers(teamName),
      message.data);
  }

  private handleChangeNick(sender: IServerParticipant, message: IChangeNickMessage, teamName: string): void {
    if (sender.nick !== message.data) {
      sender.nick = message.data;
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== sender.participantId),
        sender,
        EMemberStatusChange.ChangedNick);
      this.messageService.sendSelf(sender);
    }
  }

  private handleChangeScrumMaster(sender: IServerParticipant, message: IChangeNickMessage, teamName: string): void {
    if (sender.participantId !== message.data) {
      const newScrumMaster = this.storage.getParticipant(message.data);
      if (newScrumMaster) {
        sender.role = ERole.Developer;
        newScrumMaster.role = ERole.ScrumMaster;
        this.messageService.broadcastMemberChange(
          this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== sender.participantId),
          sender,
          EMemberStatusChange.ChangedRole);
        this.messageService.broadcastMemberChange(
          this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== newScrumMaster.participantId),
          newScrumMaster,
          EMemberStatusChange.ChangedRole);
        this.messageService.sendSelf(sender);
        this.messageService.sendSelf(newScrumMaster);
      }
      else { // TODO 2376 check if we ever can come here -> this should be covered in preflight
        this.messageService.sendErrorMessageToParticipant(sender, EErrorCode.ParticipantNotFound);
      }
    }
  }

  private handleCreate(sender: IServerParticipant, message: ICreatemessage): void {
    this.loggerService.info('Server', `Create: '${sender.nick}' is creating '${message.data.team}'`);
    const cardSet = message.data.cardSet === ECardSet.Custom ?
      message.data.cards || this.cardService.getCardSet(ECardSet.Cohn) :
      this.cardService.getCardSet(message.data.cardSet);
    // create the team
    const newGame = this.storage.createTeam(message.data.team, cardSet);
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    sender.role = ERole.ScrumMaster;
    // join the team
    this.storage.joinTeam(message.data.team, sender.participantId);
    // provide the sender with the current game state
    this.messageService.sendAllInfo(
      sender,
      newGame,
      new Array<IServerParticipant>(),
      cardSet,
      new Array<IEstimation>());
  }

  private handleEstimate(sender: IServerParticipant, message: IEstimateMessage, teamName: string): void {
    let result: IEstimation;
    const team = this.storage.getTeam(teamName);
    if (team) {
      if (message.data >= 0) {
        result = this.storage.upsertEstimation(teamName, sender.participantId, message.data);
      }
      else {
        result = this.storage.deleteEstimation(teamName, sender.participantId);
      }
      this.storage
        .getConnectedTeamMembers(teamName)
        .forEach((p: IServerParticipant) => {
          const toSend = this.prepareEstimationsData(p, team.status === EPokerStatus.Revealed, [result]);
          this.messageService.sendEstimations(p, toSend);
        });
    }
  }

  private handleJoin(sender: IServerParticipant, message: IJoinMessage, teamName: string): void {
    this.loggerService.info('Server', `Join: '${sender.nick}' is joining '${message.data.team}'`);
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
        this.prepareEstimationsData(sender, team.status === EPokerStatus.Revealed, this.storage.getEstimations(teamName))
      );
      // tell the others someone joined
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== sender.participantId),
        sender,
        EMemberStatusChange.Joined);
    }
  }

  private handleRemove(message: IRemoveMessage, teamName: string): void {
    const toRemove = this.storage.getParticipant(message.data);
    if (toRemove) {
      this.storage.deleteParticipant(toRemove.participantId, teamName);
      // tell the others someone left
      toRemove.status = EParticipantStatus.Left;
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => toRemove.participantId !== p.participantId),
        toRemove,
        EMemberStatusChange.Left);
    }
  }

  private handleLeave(sender: IServerParticipant, message: ILeaveMessage, teamName: string): void {
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
          EMemberStatusChange.Left);
        this.messageService.sendLeft(sender);
      }
      if (sender.participantId !== message.data) {
        this.storage.deleteParticipant(sender.participantId, teamName);
      }
    }
  }

  private handleObserve(message: IObserveMessage, teamName: string): void {
    const member = this.storage.getParticipant(message.data.member);
    if (member && member.observer !== message.data.observer) {
      member.observer = message.data.observer;
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== member.participantId),
        member,
        EMemberStatusChange.Observe);
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
      EMemberStatusChange.Paused);
  }

  private handleRejoin(sender: IServerParticipant, message: IRejoinMessage, teamName: string, ws: IWebSocket): void {
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
        this.prepareEstimationsData(sender, team.status === EPokerStatus.Revealed, this.storage.getEstimations(teamName))
      );
      // tell the others that participant rejoined
      this.messageService.broadcastMemberChange(
        this.storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => p.participantId !== oldParticipant.participantId),
        oldParticipant,
        EMemberStatusChange.Rejoined);
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
      .forEach((p: IServerParticipant) => {
        const toSend = this.prepareEstimationsData(p, result[0] === EPokerStatus.Revealed, result[1]);
        this.messageService.sendEstimations(p, toSend);
      });
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

  //#region private helpers ---------------------------------------------------
  private prepareEstimationsData(to: IServerParticipant, revealed: boolean, estimations: Array<IEstimation>): Array<IEstimation> {
    return estimations.map(estimation => {
      const index: number = estimation.cardIndex < 0 ?
        estimation.cardIndex :
        // TODO 2383 remove 999 to indicate that we do not want to send the estimated value
        revealed || estimation.participantId === to.participantId ? estimation.cardIndex : 999
      return this.storage.createEstimation(estimation.participantId, index, revealed || estimation.participantId === to.participantId);
    });
  }
  //#endregion
}