import { injectable } from "inversify";
import { IServerParticipant } from "objects";

import { AClientMessage, EClientMessageType, EErrorCode, EParticipantStatus, EPokerStatus, ERole, ICard, ICardSet, IChangeCardSetMessage, IChangeNickMessage, IChangeScrumMasterMessage, ICreatemessage, IEstimateMessage, IJoinMessage, ILeaveMessage, IObserveMessage, IRejoinMessage, IRemoveMessage } from "../../../../shared-lib/src";
import { IStorageService } from "../../storage/interfaces";
import { IPreflightService } from "../interfaces";

@injectable()
export class PreflightService implements IPreflightService {

  //#region IPreflightService methods -----------------------------------------
  public preflight(storageService: IStorageService, message: AClientMessage, teamName: string): EErrorCode {
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
      case (EClientMessageType.Create):
        result = this.preflightCreate(storageService, teamName, <ICreatemessage>message);
        break;
      case (EClientMessageType.ChangeCardSet): {
        result = this.preflightChangeCardSet(storageService, sender, teamName, <IChangeCardSetMessage>message);
        break;
      }
      case (EClientMessageType.ChangeNick): {
        result = this.preflightChangeNick(<IChangeNickMessage>message);
        break;
      }
      case (EClientMessageType.ChangeScrumMaster): {
        result = this.preflightChangeScrumMaster(storageService, sender, teamName, <IChangeScrumMasterMessage>message);
        break;
      }
      case (EClientMessageType.Estimate): {
        result = this.preflightEstimate(storageService, sender, teamName, <IEstimateMessage>message);
        break;
      }
      case (EClientMessageType.Join): {
        result = this.preflightJoin(storageService, sender, teamName, <IJoinMessage>message,);
        break;
      }
      case (EClientMessageType.Leave): {
        result = this.preflightLeave(storageService, sender, teamName, <ILeaveMessage>message);
        break;
      }
      case (EClientMessageType.Observe): {
        result = this.preflightObserve(storageService, sender, teamName, <IObserveMessage>message);
        break;
      }
      case (EClientMessageType.Pause): {
        result = this.preflightPause(storageService, sender, teamName);
        break;
      }
      case (EClientMessageType.Remove): {
        result = this.preflightRemove(storageService, sender, teamName, <IRemoveMessage>message);
        break;
      }
      case (EClientMessageType.Reveal): {
        result = this.preflightReveal(storageService, sender, teamName);
        break;
      }
      case (EClientMessageType.Start): {
        result = this.preflightStart(storageService, sender, teamName);
        break;
      }
      case (EClientMessageType.Rejoin): {
        result = this.preflightRejoin(storageService, sender, teamName, <IRejoinMessage>message);
        break;
      }
    } // end switch

    return result;

  }

  //#region message specific methods ------------------------------------------
  /**
   * - team may not exist
   * - nickname may not be empty
   * - cards, if given, must be a valid card set
   */
  private preflightCreate(storage: IStorageService, teamName: string, message: ICreatemessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (storage.teamExists(teamName)) {
      result = EErrorCode.TeamAlreadyExists;
    }
    else if (message.data.nick.length === 0) {
      result = EErrorCode.ParticipantNameMayNotBeEmpty;
    }
    else {
      if (message.data.cards) {
        result = this.checkCardSet(message.data.cards);
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - send must be in the team
   * - cardset must be valid
   */
  private preflightChangeCardSet(storage: IStorageService, sender: IServerParticipant, teamName: string, message: IChangeCardSetMessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else {
      result = this.checkCardSet(message.data);
    }
    return result;
  }

  /**
   * - nickname may not be empty
   */
  private preflightChangeNick(message: IChangeNickMessage): EErrorCode {
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
  private preflightChangeScrumMaster(storage: IStorageService, sender: IServerParticipant, teamName: string, message: IChangeScrumMasterMessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else if (storage.getTeamOfParticipant(message.data)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    } else {
      const newScrumMaster = storage.getParticipant(message.data);
      if (!newScrumMaster){
        result = EErrorCode.ParticipantNotFound;
      } else if (newScrumMaster.status !== EParticipantStatus.Connected) {
        result = EErrorCode.NewScrumMasterIsNotConnected;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - sender may not be an observer
   * - sender must be in the team
   * - team status must be started
   * - card must be in the card set of the team
   */
  private preflightEstimate(storage: IStorageService, sender: IServerParticipant, teamName: string, message: IEstimateMessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (sender.observer) {
      result = EErrorCode.ObserverCanNotEstimate;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      }
      else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.status !== EPokerStatus.Started) {
        result = EErrorCode.EstimationNotStarted;
      } else {
        const cardSet = storage.getCardSet(teamName);
        const theEstimation = cardSet.cards.find((card: ICard) => card.index === message.data);
        if (theEstimation === undefined) {
          result = EErrorCode.InvalidEstimation;
        }
      }
    }
    return result;
  }

  /**
   * - nickname may not be empty
   * - team must exist
   * - sender may not be in any team
   */
  private preflightJoin(storage: IStorageService, sender: IServerParticipant, teamName: string, message: IJoinMessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (message.data.nick.length === 0) {
      result = EErrorCode.ParticipantNameMayNotBeEmpty;
    } else if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
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
   * - if this is a normal leave
   *   - sender must be in team
   * - if this is a leave after disconnect (participant is sending a leave on behalf of his previous participantId)
   *   - sender may not be in a team
   *   - leaving participant must exist
   *   - leaving participant must be in the team
   */
  private preflightLeave(storage: IStorageService, sender: IServerParticipant, teamName: string, message: ILeaveMessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (message.data === sender.participantId) {
      if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
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
  private preflightObserve(storage: IStorageService, sender: IServerParticipant, teamName: string, message: IObserveMessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
    } else if (sender.participantId !== message.data.member) {
      if (sender.role !== ERole.ScrumMaster) {
        result = EErrorCode.ScrumMasterRequired;
      } else if (!storage.participantExists(message.data.member)) {
        result = EErrorCode.ParticipantNotFound;
      } else if (storage.getTeamOfParticipant(message.data.member)?.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be in the team
   */
  private preflightPause(storage: IStorageService, sender: IServerParticipant, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (storage.getTeamOfParticipant(sender.participantId)?.teamName !== teamName) {
      result = EErrorCode.ParticipantNotInTeam;
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
  private preflightRemove(storage: IStorageService, sender: IServerParticipant, teamName: string, message: IRemoveMessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
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
   * - team status must be 'started'
   */
  private preflightReveal(storage: IStorageService, sender: IServerParticipant, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.status !== EPokerStatus.Started) {
        result = EErrorCode.EstimationNotStarted;
      }
    }
    return result;
  }

  /**
   * - team must exist
   * - sender must be scrum master
   * - sender must be in team
   * - team status may not be 'started'
   * - at least one team member should not be observer
   */
  private preflightStart(storage: IStorageService, sender: IServerParticipant, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (sender.role !== ERole.ScrumMaster) {
      result = EErrorCode.ScrumMasterRequired;
    } else {
      const team = storage.getTeamOfParticipant(sender.participantId);
      if (!team) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.teamName !== teamName) {
        result = EErrorCode.ParticipantNotInTeam;
      } else if (team.status === EPokerStatus.Started) {
        result = EErrorCode.EstimationAlreadyStarted;
      } else if (storage.getConnectedTeamMembers(teamName).filter((p: IServerParticipant) => !p.observer).length === 0){
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
  private preflightRejoin(storage: IStorageService, sender: IServerParticipant, teamName: string, message: IRejoinMessage): EErrorCode {
    let result = EErrorCode.NoError;
    if (!storage.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
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
  //#endregion

  //#region private helper methods --------------------------------------------
  /**
   * - the cardset must contain the unknown estimation card
   * - the cardset must at least contain two cards which are estimations
   */
  private checkCardSet(cardSet: ICardSet): EErrorCode {
    const unknownEstimationCard = cardSet.cards.find((card: ICard) => card.isUnknownEstimation);
    if (!unknownEstimationCard) {
      return EErrorCode.UnknownEstimationCardMissing;
    }
    const estimationCards = cardSet.cards.filter((card: ICard) => card.isEstimation).length;
    if (estimationCards < 2) {
      return EErrorCode.MoreThanTwoEstimationCardsRequired;
    }
    return EErrorCode.NoError;
  }
  //#endregion
}