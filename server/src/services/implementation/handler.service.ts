import { inject, injectable } from 'inversify';
import {
  AClientMessageDto,
  CardDto,
  ChangeCardSetMessageDto,
  ChangeNickMessageDto,
  ChangeScrumMasterMessageDto,
  CreateDto,
  CreateMessageDto,
  ECardSetType,
  EClientMessageType,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  EParticipantState,
  ERole,
  ESessionEndedReason,
  EstimateMessageDto,
  EstimationDto,
  JoinDto,
  JoinMessageDto,
  LeaveMessageDto,
  LooseObjectDto,
  RejoinMessageDto,
  RemoveParticipantMessageDto,
  ToggleObserverDto,
  ToggleObserverMessageDto
} from 'shared-lib';
import { IServerEstimation, IServerParticipant, IServerTeam } from '../../objects/interfaces/index.js';
import { IFactoryService, IStorageService } from '../../storage/interfaces/index.js';
import STORAGETYPES from '../../storage/storage.types.js';
import type { IHandlerService, ILoggerService, IMessageService, IPreflightService } from '../interfaces/index.js';
import SERVICETYPES from '../service.types.js';
import { IWebSocket } from '../websocket.js';

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
    @inject(STORAGETYPES.StorageService) storage: IStorageService
  ) {
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
    // set the connection state to disconnected
    // if the user was in a game: send other participants an update
    const closed = this.storage.filterParticipants((p: IServerParticipant) => p.socket == ws)[0];
    if (closed) {
      if (closed.state !== EParticipantState.Paused) {
        this.loggerService.info('Server', `'${closed.nick}'' has been disconnected`);
        closed.state = EParticipantState.Disconnected;
        const team = this.storage.getTeamOfParticipant(closed.participantId);
        if (team) {
          this.loggerService.info('Server', 'sending disconnection to other participants');
          this.messageService.broadcastMemberChange(
            this.storage
              .getConnectedTeamMembers(team.teamName)
              .filter((p: IServerParticipant) => p.participantId !== closed.participantId),
            closed,
            EParticipantChangeType.Disconnected
          );
          if (closed.role === ERole.ScrumMaster) {
            // assign some random participant the scrum master role
            const newScrumMaster = this.storage.getFirstConnectedTeamMember(team.teamName);
            if (newScrumMaster) {
              closed.role = ERole.Developer;
              newScrumMaster.role = ERole.ScrumMaster;
              this.messageService.broadcastMemberChange(
                this.storage
                  .getConnectedTeamMembers(team.teamName)
                  .filter((p: IServerParticipant) => p.participantId !== newScrumMaster.participantId),
                newScrumMaster,
                EParticipantChangeType.ChangedRole
              );
              this.messageService.sendSelf(newScrumMaster);
            }
          }
          // if the team is estimating remove the senders estimation and send an update to the others
          if (team.gameState === EGameState.Started) {
            this.storage.deleteEstimation(team.teamName, closed.participantId);
            const estimationDtos = this.mapServerEstimationsToDtos(this.storage.getEstimations(team.teamName));
            this.messageService.broadcastEstimations(
              team.gameState,
              this.storage.getConnectedTeamMembers(team.teamName),
              estimationDtos
            );
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
    this.messageService.sendStartHandshake(newParticipant);
    return newParticipant;
  }

  public handleCronTick(maxIdleTime: number): void {
    this.loggerService.info('Server', 'Cron tick');
    this.storage
      .filterTeams((team: IServerTeam) => Date.now() - team.lastAccessTime > maxIdleTime)
      .forEach((team: IServerTeam) => {
        this.loggerService.info('Server', `Cron Tick: deleting '${team.teamName}'`);
        this.messageService.broadcastSessionEnded(
          this.storage.getConnectedTeamMembers(team.teamName),
          ESessionEndedReason.IdleTimeOut
        );
        this.storage.deleteTeam(team.teamName);
      });
  }

  public handleError(ws: IWebSocket, error: Error): void {
    this.loggerService.logError('Server', error);
    this.messageService.sendException(ws, error.message);
  }

  public handleMessage(message: AClientMessageDto, teamName: string, ws: IWebSocket): void {
    const preflight = this.preflightService.preflight(this.storage, message, teamName);

    if (preflight !== EErrorCode.NoError) {
      this.messageService.sendErrorMessageToSocket(ws, preflight);
    } else {
      const participant = this.storage.getParticipant(message.senderId);
      if (participant) {
        this.processMessage(participant, message, teamName, ws);
      }
    }
  }

  public handlePing(): void {
    this.loggerService.info('Server', 'ping');
    this.storage
      .filterParticipants((participant: IServerParticipant) => participant.state === EParticipantState.Connected)
      .forEach((participant) => this.messageService.sendPing(participant));
  }

  public handleReset(): LooseObjectDto {
    const response: LooseObjectDto = {};
    response.teams = this.storage.allTeams.length;
    response.totalMembers = 0;
    response.removedTeams = new Array<LooseObjectDto>();
    this.storage.allTeams().forEach((team: IServerTeam) => {
      this.loggerService.info('Server', `System reset: removing '${team.teamName}'`);
      const connectedTeamMembers = this.storage.getConnectedTeamMembers(team.teamName);
      const removedTeam: LooseObjectDto = {};
      removedTeam.team = team.teamName;
      removedTeam.removedMembers = this.storage
        .deleteTeam(team.teamName)
        .map((p: IServerParticipant) => `${p.nick} - ${p.participantId}`);
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.totalMembers += removedTeam.removedMembers.length;
      this.messageService.broadcastSessionEnded(connectedTeamMembers, ESessionEndedReason.ServerReset);
    });
    return response;
  }
  //#endregion

  //#region message handling methods ------------------------------------------
  private processMessage(
    sender: IServerParticipant,
    message: AClientMessageDto,
    teamName: string,
    ws: IWebSocket
  ): void {
    if (message.type === EClientMessageType.Create) {
      this.handleCreate(sender, teamName, <CreateMessageDto>message);
    } else {
      switch (message.type) {
        case EClientMessageType.ChangeCardSet: {
          this.handleChangeCardSet(teamName, <ChangeCardSetMessageDto>message);
          break;
        }
        case EClientMessageType.ChangeNick: {
          this.handleChangeNick(sender, teamName, <ChangeNickMessageDto>message);
          break;
        }
        case EClientMessageType.ChangeScrumMaster: {
          this.handleChangeScrumMaster(sender, teamName, <ChangeScrumMasterMessageDto>message);
          break;
        }
        case EClientMessageType.Estimate: {
          this.handleEstimate(sender, teamName, <EstimateMessageDto>message);
          break;
        }
        case EClientMessageType.Join: {
          this.handleJoin(sender, teamName, <JoinMessageDto>message);
          break;
        }
        case EClientMessageType.Leave: {
          this.handleLeave(sender, teamName, <LeaveMessageDto>message);
          break;
        }
        case EClientMessageType.Observe: {
          this.handleObserve(teamName, <ToggleObserverMessageDto>message);
          break;
        }
        case EClientMessageType.Pause: {
          this.handlePause(sender, teamName);
          break;
        }
        case EClientMessageType.Remove: {
          this.handleRemove(teamName, <RemoveParticipantMessageDto>message);
          break;
        }
        case EClientMessageType.Reveal: {
          this.handleReveal(teamName);
          break;
        }
        case EClientMessageType.Start: {
          this.handleStart(teamName);
          break;
        }
        case EClientMessageType.Rejoin: {
          this.handleRejoin(sender, teamName, <RejoinMessageDto>message, ws);
          break;
        }
        case EClientMessageType.WithdrawEstimation: {
          this.handleEstimationWithdrawn(teamName, sender.participantId);
        }
        // The default (EErrorCode.UnknownClientMessage) is already handled in preflight
      }
    }
  }

  private handleChangeCardSet(teamName: string, message: ChangeCardSetMessageDto): void {
    this.storage.setCardSet(teamName, message.data);
    // broad cast the new card set to all connected team members
    this.messageService.broadcastCardSet(this.storage.getConnectedTeamMembers(teamName), message.data);
  }

  private handleChangeNick(sender: IServerParticipant, teamName: string, message: ChangeNickMessageDto): void {
    if (sender.nick !== message.data) {
      sender.nick = message.data;
      // broadcast the nick change to other participants
      this.messageService.broadcastMemberChange(
        this.storage
          .getConnectedTeamMembers(teamName)
          .filter((p: IServerParticipant) => p.participantId !== sender.participantId),
        sender,
        EParticipantChangeType.ChangedNick
      );
      this.messageService.sendSelf(sender);
    }
  }

  private handleChangeScrumMaster(sender: IServerParticipant, teamName: string, message: ChangeNickMessageDto): void {
    if (sender.participantId !== message.data) {
      const newScrumMaster = this.storage.getParticipant(message.data);
      if (newScrumMaster) {
        sender.role = ERole.Developer;
        newScrumMaster.role = ERole.ScrumMaster;
        this.messageService.broadcastMemberChange(
          this.storage
            .getConnectedTeamMembers(teamName)
            .filter((p: IServerParticipant) => p.participantId !== sender.participantId),
          sender,
          EParticipantChangeType.ChangedRole
        );
        // broadcast the change to everyone, except the new scrum master
        this.messageService.broadcastMemberChange(
          this.storage
            .getConnectedTeamMembers(teamName)
            .filter((p: IServerParticipant) => p.participantId !== newScrumMaster.participantId),
          newScrumMaster,
          EParticipantChangeType.ChangedRole
        );
        // send self to the old scrum master
        this.messageService.sendSelf(sender);
        // send self to the new scrum master
        this.messageService.sendSelf(newScrumMaster);
      }
    }
  }

  private handleCreate(sender: IServerParticipant, teamName: string, message: CreateMessageDto): void {
    this.loggerService.info('Server', `Create: '${sender.nick}' is creating '${teamName}'`);
    const data = message.data as CreateDto;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cardSet =
      data.cardSet == ECardSetType.Custom
        ? data.cards || this.factoryService.createCardSet(ECardSetType.Cohn)
        : this.factoryService.createCardSet(data.cardSet);
    // create the team
    const newTeam = this.factoryService.createTeam(teamName);
    this.storage.addTeam(newTeam, cardSet);
    sender.observer = data.observer;
    sender.nick = data.nick;
    sender.role = ERole.ScrumMaster;
    // join the team
    this.storage.joinTeam(teamName, sender.participantId);
    // provide the sender with the current team state
    this.messageService.sendHandshakeSequence(sender, newTeam, new Array<IServerParticipant>(), cardSet);
    this.messageService.sendGameStateChanged(sender, newTeam.gameState);
  }

  private handleEstimate(sender: IServerParticipant, teamName: string, message: EstimateMessageDto): void {
    const team = this.storage.getTeam(teamName);
    if (team) {
      const upserted = this.storage.upsertEstimation(teamName, sender.participantId, message.data);
      const result = this.factoryService.createEstimation(upserted.participantId, upserted.cardIndex);
      this.messageService.broadcastEstimations(team.gameState, this.storage.getConnectedTeamMembers(teamName), [
        result
      ]);
    }
  }

  private handleJoin(sender: IServerParticipant, teamName: string, message: JoinMessageDto): void {
    this.loggerService.info('Server', `Join: '${sender.nick}' is joining '${teamName}'`);
    const data = message.data as JoinDto;
    sender.role = ERole.Developer;
    sender.observer = data.observer;
    sender.nick = data.nick;
    const team = this.storage.getTeam(teamName);
    if (team) {
      this.storage.joinTeam(teamName, sender.participantId);
      // send team info
      this.messageService.sendHandshakeSequence(
        sender,
        team,
        this.storage
          .getTeamMembers(teamName)
          .filter((p: IServerParticipant) => p.participantId !== sender.participantId),
        this.storage.getCardSet(teamName)
      );
      // send game info
      this.messageService.sendGameStateChanged(sender, team.gameState);
      const estimationsDtos = this.mapServerEstimationsToDtos(this.storage.getEstimations(team.teamName));
      this.messageService.sendEstimations(team.gameState, sender, estimationsDtos);
      // tell the others someone joined
      this.messageService.broadcastMemberChange(
        this.storage
          .getConnectedTeamMembers(teamName)
          .filter((p: IServerParticipant) => p.participantId !== sender.participantId),
        sender,
        EParticipantChangeType.Joined
      );
    }
  }

  private handleRemove(teamName: string, message: RemoveParticipantMessageDto): void {
    const toRemove = this.storage.getParticipant(message.data);
    if (toRemove) {
      this.storage.deleteParticipant(toRemove.participantId, teamName);
      // tell the others someone left
      toRemove.state = EParticipantState.Left;
      this.messageService.broadcastMemberChange(
        this.storage
          .getConnectedTeamMembers(teamName)
          .filter((p: IServerParticipant) => toRemove.participantId !== p.participantId),
        toRemove,
        EParticipantChangeType.Left
      );
    }
  }

  private handleLeave(sender: IServerParticipant, teamName: string, message: LeaveMessageDto): void {
    if (sender.role === ERole.ScrumMaster) {
      this.loggerService.info('Server', `'${sender.nick}' is disbanding '${teamName}'`);
      this.messageService.broadcastSessionEnded(
        this.storage.getConnectedTeamMembers(teamName),
        ESessionEndedReason.Disbanded
      );
      this.storage.deleteTeam(teamName);
    } else {
      // if the data is not equal to the senders participantId
      // this is a previously disconnected user that does not want to come back
      const leaving = message.data !== sender.participantId ? this.storage.getParticipant(message.data) : sender;
      if (leaving) {
        this.loggerService.info('Server', `Leave: '${leaving.nick}' is leaving '${teamName}'`);
        this.storage.deleteParticipant(leaving.participantId, teamName);
        // tell the others someone left
        leaving.state = EParticipantState.Left;
        this.messageService.broadcastMemberChange(
          this.storage
            .getConnectedTeamMembers(teamName)
            .filter((p: IServerParticipant) => p.participantId !== leaving.participantId),
          leaving,
          EParticipantChangeType.Left
        );
        // Acknowledge to the sender by sending him end-session
        this.messageService.sendSessionEnded(sender, ESessionEndedReason.SelfInflicted);
      }
      if (message.data !== sender.participantId) {
        this.storage.deleteParticipant(sender.participantId, teamName);
      } else {
        const team = this.storage.getTeam(teamName);
        if (team && team.gameState === EGameState.Started) {
          const estimationDtos = this.mapServerEstimationsToDtos(this.storage.getEstimations(team.teamName));
          this.messageService.broadcastEstimations(
            team.gameState,
            this.storage.getConnectedTeamMembers(teamName),
            estimationDtos
          );
        }
      }
    }
  }

  private handleObserve(teamName: string, message: ToggleObserverMessageDto): void {
    const data = message.data as ToggleObserverDto;
    const participant = this.storage.getParticipant(data.participantId);
    if (participant && participant.observer !== data.observer) {
      participant.observer = data.observer;
      this.messageService.broadcastMemberChange(
        this.storage
          .getConnectedTeamMembers(teamName)
          .filter((p: IServerParticipant) => p.participantId !== participant.participantId),
        participant,
        EParticipantChangeType.Observe
      );
      this.messageService.sendSelf(participant);
    }
  }

  private handlePause(sender: IServerParticipant, teamName: string): void {
    this.loggerService.info('Server', `Pause: '${sender.nick}'`);
    sender.state = EParticipantState.Paused;
    // inform the others
    this.messageService.broadcastMemberChange(
      this.storage
        .getConnectedTeamMembers(teamName)
        .filter((p: IServerParticipant) => p.participantId !== sender.participantId),
      sender,
      EParticipantChangeType.Paused
    );
    // if the team is estimating remove the senders estimation and send an update to the others
    const team = this.storage.getTeam(teamName);
    if (team && team.gameState === EGameState.Started) {
      this.storage.deleteEstimation(teamName, sender.participantId);
      const estimationDtos = this.mapServerEstimationsToDtos(this.storage.getEstimations(team.teamName));
      this.messageService.broadcastEstimations(
        team.gameState,
        this.storage.getConnectedTeamMembers(teamName),
        estimationDtos
      );
    }
    // Acknowledge to the sender
    this.messageService.sendSelf(sender);
  }

  private handleRejoin(sender: IServerParticipant, teamName: string, message: RejoinMessageDto, ws: IWebSocket): void {
    this.loggerService.info('Server', `Rejoin: '${message.senderId}' => '${message.data}' `);
    // find the original participant and the game he was in
    const oldParticipant = this.storage.getParticipant(message.data);
    const team = this.storage.getTeam(teamName);
    if (oldParticipant && team) {
      // remove the sender
      this.storage.deleteParticipant(sender.participantId, teamName);
      // update the original participant
      oldParticipant.state = EParticipantState.Connected;
      oldParticipant.socket = ws;
      // send team info
      this.messageService.sendHandshakeSequence(
        oldParticipant,
        team,
        this.storage
          .getTeamMembers(teamName)
          .filter((p: IServerParticipant) => p.participantId !== oldParticipant.participantId),
        this.storage.getCardSet(teamName)
      );
      // send game info
      this.messageService.sendGameStateChanged(sender, team.gameState);
      const estimationDtos = this.mapServerEstimationsToDtos(this.storage.getEstimations(team.teamName));
      this.messageService.sendEstimations(team.gameState, sender, estimationDtos);
      // if no one else is connected, make this one the new scrum master
      const connectedTeamMembers = this.storage
        .getConnectedTeamMembers(teamName)
        .filter((p: IServerParticipant) => p.participantId !== oldParticipant.participantId);
      if (connectedTeamMembers.length > 0) {
        // tell the others that participant rejoined
        this.messageService.broadcastMemberChange(
          connectedTeamMembers,
          oldParticipant,
          EParticipantChangeType.Rejoined
        );
      } else if (oldParticipant.role !== ERole.ScrumMaster) {
        oldParticipant.role = ERole.ScrumMaster;
        this.messageService.sendSelf(oldParticipant);
      }
    }
  }

  private handleReveal(teamName: string): void {
    const team = this.storage.getTeam(teamName);
    if (team) {
      this.storage.reveal(teamName);
      this.messageService.broadcastGameState(this.storage.getConnectedTeamMembers(teamName), EGameState.Revealed);
      const estimations = this.storage.getEstimations(teamName);
      const estimationMap = new Map<string, IServerEstimation>(
        estimations.map((e: IServerEstimation) => [e.participantId, e])
      );
      const unknownEstimation = this.storage
        .getCardSet(teamName)
        .cards.find((c: CardDto) => c.isUnknownEstimation == true)! as CardDto;
      const allParticipants = this.storage.getTeamMembers(teamName);
      allParticipants.forEach((p: IServerParticipant) => {
        if (!estimationMap.has(p.participantId)) {
          estimations.push({
            participantId: p.participantId,
            cardIndex: unknownEstimation.index
          });
        }
      });
      const estimationDtos = this.mapServerEstimationsToDtos(estimations);

      this.messageService.broadcastEstimations(
        team.gameState,
        this.storage.getConnectedTeamMembers(teamName),
        estimationDtos
      );
    }
  }

  private handleStart(teamName: string): void {
    const result = this.storage.startEstimating(teamName);
    this.messageService.broadcastClearEstimations(this.storage.getConnectedTeamMembers(teamName));
    this.messageService.broadcastGameState(this.storage.getConnectedTeamMembers(teamName), result);
  }

  private handleEstimationWithdrawn(teamName: string, participantId: string): void {
    this.storage.deleteEstimation(teamName, participantId);
    this.messageService.broadcastEstimationWithDrawn(this.storage.getTeamMembers(teamName), participantId);
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  private mapServerEstimationsToDtos(estimations: Array<IServerEstimation>): Array<EstimationDto> {
    return estimations.map((estimation: IServerEstimation) =>
      this.factoryService.createEstimation(estimation.participantId, estimation.cardIndex)
    );
  }
  //#endregion
}
