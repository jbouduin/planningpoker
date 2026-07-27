import { injectable } from 'inversify';

import {
  AClientMessageDto,
  CardDto,
  CardSetDto,
  ChangeCardSetMessageDto,
  ChangeNickMessageDto,
  ChangeScrumMasterMessageDto,
  CreateDto,
  CreateMessageDto,
  DisbandMessageDto,
  EClientMessageType,
  EErrorCode,
  EGameState,
  EParticipantState,
  ERole,
  EstimateMessageDto,
  JoinDto,
  JoinMessageDto,
  LeaveMessageDto,
  RejoinMessageDto,
  RemoveParticipantMessageDto,
  ToggleObserverDto,
  ToggleObserverMessageDto
} from 'shared-lib';
import type { IServerParticipant } from '../../objects/interfaces/index.js';
import type { IStorageService } from '../../storage/interfaces/index.js';
import type { IPreflightService } from '../interfaces/index.js';

@injectable()
export class PreflightService implements IPreflightService {
  //#region IPreflightService methods -----------------------------------------
  public preflight(storageService: IStorageService, message: AClientMessageDto, teamName: string): EErrorCode {
    // Teamname must have a value
    if (teamName.length === 0) {
      return EErrorCode.TeamNameMayNotBeEmtpy;
    }

    // sender must be a known participant
    const sender = storageService.getParticipant(message.senderId);
    if (!sender) {
      return EErrorCode.ParticipantNotFound;
    }
    // message type specific validations
    let result: EErrorCode;
    switch (message.type) {
      case EClientMessageType.Create:
        result = this.preflightCreate(storageService, teamName, <CreateMessageDto>message);
        break;
      case EClientMessageType.ChangeCardSet: {
        result = this.preflightChangeCardSet(storageService, sender, teamName, <ChangeCardSetMessageDto>message);
        break;
      }
      case EClientMessageType.ChangeNick: {
        result = this.preflightChangeNick(<ChangeNickMessageDto>message);
        break;
      }
      case EClientMessageType.ChangeScrumMaster: {
        result = this.preflightChangeScrumMaster(
          storageService,
          sender,
          teamName,
          <ChangeScrumMasterMessageDto>message
        );
        break;
      }
      case EClientMessageType.ClearEstimations: {
        result = this.preflightClear(storageService, sender, teamName);
        break;
      }
      case EClientMessageType.Disband: {
        result = this.preflightDisband(storageService, sender, teamName, <DisbandMessageDto>message);
        break;
      }
      case EClientMessageType.Estimate: {
        result = this.preflightEstimate(storageService, sender, teamName, <EstimateMessageDto>message);
        break;
      }
      case EClientMessageType.Join: {
        result = this.preflightJoin(storageService, sender, teamName, <JoinMessageDto>message);
        break;
      }
      case EClientMessageType.Leave: {
        result = this.preflightLeave(storageService, sender, teamName, <LeaveMessageDto>message);
        break;
      }
      case EClientMessageType.Observe: {
        result = this.preflightObserve(storageService, sender, teamName, <ToggleObserverMessageDto>message);
        break;
      }
      case EClientMessageType.Pause: {
        result = this.preflightPause(storageService, sender, teamName);
        break;
      }
      case EClientMessageType.Remove: {
        result = this.preflightRemove(storageService, sender, teamName, <RemoveParticipantMessageDto>message);
        break;
      }
      case EClientMessageType.Reveal: {
        result = this.preflightReveal(storageService, sender, teamName);
        break;
      }
      case EClientMessageType.Start: {
        result = this.preflightStart(storageService, sender, teamName);
        break;
      }
      case EClientMessageType.Rejoin: {
        result = this.preflightRejoin(storageService, sender, teamName, <RejoinMessageDto>message);
        break;
      }
      case EClientMessageType.WithdrawEstimation: {
        result = this.preflightWithdrawEstimation(storageService, sender, teamName);
        break;
      }
      default:
        result = EErrorCode.UnknownClientMessageType;
    } // end switch

    return result;
  }

  //#region message specific methods ------------------------------------------
  /**
   * - team may not exist
   * - nickname may not be empty
   * - cards, if given, must be a valid card set
   */
  private preflightCreate(storage: IStorageService, teamName: string, message: CreateMessageDto): EErrorCode {
    let result = EErrorCode.NoError;
    const data = message.data as CreateDto;
    if (storage.teamExists(teamName)) {
      result = EErrorCode.TeamAlreadyExists;
    } else if (data.nick.length == 0) {
      result = EErrorCode.ParticipantNameMayNotBeEmpty;
    } else {
      if (data.cards) {
        result = this.checkCardSet(data.cards);
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be in the team
   * - team may not be estimating
   * - cardset must be valid
   */
  private preflightChangeCardSet(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    message: ChangeCardSetMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.gameState === EGameState.Started) {
        result = EErrorCode.ChangeCardSetNotAllowedDuringEstimation;
      } else if (sender.role !== ERole.ScrumMaster) {
        result = EErrorCode.ScrumMasterRequired;
      } else {
        result = this.checkCardSet(message.data);
      }
    }
    return result;
  }

  /**
   * - nickname may not be empty
   */
  private preflightChangeNick(message: ChangeNickMessageDto): EErrorCode {
    let result = EErrorCode.NoError;
    if (message.data.length === 0) {
      result = EErrorCode.ParticipantNameMayNotBeEmpty;
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be in the team
   * - sender must be scrum master
   * - new scrum master must be a known participant
   * - new scrum master must be in the team
   */
  private preflightChangeScrumMaster(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    message: ChangeScrumMasterMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else {
      const newScrumMaster = storage.getParticipant(message.data);
      if (!newScrumMaster) {
        result = EErrorCode.ParticipantNotFound;
      } else if (newScrumMaster.state !== EParticipantState.Connected) {
        result = EErrorCode.NewScrumMasterIsNotConnected;
      } else if (storage.getTeamOfParticipant(message.data)?.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be in the team
   * - user must be scrum master
   * - game must be revealed
   */
  private preflightClear(storage: IStorageService, sender: IServerParticipant, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.gameState !== EGameState.Revealed) {
        result = EErrorCode.EstimationAlreadyStarted;
      }
    }

    return result;
  }

  /**
   * - team must exist
   * - sender may not be an observer
   * - sender must be in the team
   * - game state must be started
   * - card must be in the card set of the team
   */
  private preflightEstimate(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    message: EstimateMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (sender.observer) {
      result = EErrorCode.ObserverCanNotEstimate;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.gameState !== EGameState.Started) {
        result = EErrorCode.EstimationNotStarted;
      } else {
        if (message.data) {
          const cards = storage.getCardSet(teamName).cards as Array<CardDto>;
          const theEstimation = cards.find((card: CardDto) => card.index === message.data);
          if (theEstimation === undefined) {
            result = EErrorCode.InvalidEstimation;
          }
        }
      }
    }
    return result;
  }

  /**
   *  - team must exist
   *  - sender must be scrum master
   *  - sender must be in the team
   *  - team may not be estimating
   */
  private preflightDisband(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    _message: DisbandMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId) || null;
      if (team === null || teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.gameState == EGameState.Started) {
        result = EErrorCode.DisbandNotAllowedDuringEstimation;
      } else if (sender.role != ERole.ScrumMaster) {
        result = EErrorCode.ScrumMasterRequired;
      }
    }
    return result;
  }

  /**
   * - nickname may not be empty
   * - team must exist
   * - sender may not be in any team
   */
  private preflightJoin(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    message: JoinMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    const data = message.data as JoinDto;
    if (data.nick.length === 0) {
      result = EErrorCode.ParticipantNameMayNotBeEmpty;
    } else if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else {
      const teamOfSender = storage.getTeamOfParticipant(sender.participantId);
      if (teamOfSender) {
        result = EErrorCode.ParticipantAllReadyInTeam;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - team may not be estimating
   * - if this is a normal leave
   *   - sender must be in team
   *   - sender may not be scrum master
   * - if this is a leave after disconnect (participant is sending a leave on behalf of his previous participantId)
   *   - sender may not be in a team
   *   - leaving participant must exist
   *   - leaving participant must be in the team
   */
  private preflightLeave(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    message: LeaveMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (message.data === sender.participantId) {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.gameState === EGameState.Started) {
        result = EErrorCode.LeaveNotAllowedDuringEstimation;
      } else if (sender.role == ERole.ScrumMaster) {
        result = EErrorCode.ScrumMasterCanNotLeave;
      }
    } else {
      if (storage.getTeamOfParticipant(sender.participantId)) {
        result = EErrorCode.ParticipantAllReadyInTeam;
      } else {
        if (!storage.participantExists(message.data)) {
          result = EErrorCode.ParticipantNotFound;
        } else if (storage.getTeamOfParticipant(message.data)?.teamName !== teamName) {
          result = EErrorCode.ParticipantNotInTeam;
        }
      }
    }
    return result;
  }

  /**
   * - team must exists
   * - sender must be in the team
   * - if toggling observe for another participant
   *   - sender must be scrum master
   *   - other participant must be a known participant
   *   - other participant must be in the team
   */
  private preflightObserve(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    message: ToggleObserverMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    const data = message.data as ToggleObserverDto;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    } else if (sender.participantId !== data.participantId) {
      if (sender.role !== ERole.ScrumMaster) {
        result = EErrorCode.ScrumMasterRequired;
      } else if (!storage.participantExists(data.participantId)) {
        result = EErrorCode.ParticipantNotFound;
      } else if (storage.getTeamOfParticipant(data.participantId)?.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be in the team
   * - sender may not be scrum master
   */
  private preflightPause(storage: IStorageService, sender: IServerParticipant, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    } else if (sender.role == ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterCanNotPause;
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be scrum master
   * - sender must be in the team
   * - removed participant must be a known participant
   * - removed participant must be in the team
   */
  private preflightRemove(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    message: RemoveParticipantMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    } else if (!storage.participantExists(message.data)) {
      result = EErrorCode.ParticipantNotFound;
    } else if (storage.getTeamOfParticipant(message.data)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be scrum master
   * - sender must be in team
   * - game state must be 'started'
   */
  private preflightReveal(storage: IStorageService, sender: IServerParticipant, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.gameState !== EGameState.Started) {
        result = EErrorCode.EstimationNotStarted;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be scrum master
   * - sender must be in team
   * - game state may not be 'started'
   * - at least one team member should not be observer
   */
  private preflightStart(storage: IStorageService, sender: IServerParticipant, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.gameState === EGameState.Started) {
        result = EErrorCode.EstimationAlreadyStarted;
      } else if (
        storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => !p.observer).length === 0
      ) {
        result = EErrorCode.OnlyObserversOnline;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - team must exist
   * - sender may not be in the team
   * - rejoining participant must be a known participant
   * - rejoining participant must be in the team
   */
  private preflightRejoin(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string,
    message: RejoinMessageDto
  ): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (storage.getTeamOfParticipant(sender.participantId)) {
      result = EErrorCode.ParticipantAllReadyInTeam;
    } else {
      if (!storage.participantExists(message.data)) {
        result = EErrorCode.ParticipantNotFound;
      } else if (storage.getTeamOfParticipant(message.data)?.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be in the team
   * - game state must be started
   */
  private preflightWithdrawEstimation(
    storage: IStorageService,
    sender: IServerParticipant,
    teamName: string
  ): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamNotFound;
    } else if (sender.observer) {
      result = EErrorCode.ObserverCanNotEstimate;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.gameState !== EGameState.Started) {
        result = EErrorCode.EstimationNotStarted;
      }
    }
    return result;
  }
  //#endregion

  //#region private helper methods --------------------------------------------
  /**
   * - the cardset must contain the unknown estimation card
   * - the cardset must at least contain two cards which are estimations
   */
  private checkCardSet(cardSet: CardSetDto): EErrorCode {
    const cards = cardSet.cards as Array<CardDto>;
    const unknownEstimationCard = cards.find((card: CardDto) => card.isUnknownEstimation);
    if (!unknownEstimationCard) {
      return EErrorCode.UnknownEstimationCardMissing;
    }
    const estimationCards = cards.filter((card: CardDto) => card.isEstimation).length;
    if (estimationCards < 2) {
      return EErrorCode.MoreThanTwoEstimationCardsRequired;
    }
    return EErrorCode.NoError;
  }
  //#endregion
}
