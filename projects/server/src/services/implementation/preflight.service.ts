import { injectable } from "inversify";

import { AClientMessage, EClientMessageType, EErrorCode, ERole, IChangeScrumMasterMessage, ILeaveMessage, IObserveMessage, IParticipant, IRejoinMessage, IRemoveMessage } from "../../../../shared-lib/lib";
import { IStorageService } from "../../storage/interfaces";
import { IPreflightService } from "../interfaces";

@injectable()
export class PreflightService implements IPreflightService {

  //#region IPreflightService methods -----------------------------------------
  public preflight(storageService: IStorageService, message: AClientMessage, teamName: string): EErrorCode {

    const sender = storageService.getParticipant(message.senderUuid);
    if (!sender) {
      return EErrorCode.ParticipantNotFound;
    }

    const teamExists = storageService.teamExists(teamName);
    if (message.type === EClientMessageType.Create && teamExists) {
      return EErrorCode.TeamAlreadyExists;
    }

    if (this.messageTypeRequiresTeam(message.type) && !teamExists) {
      return EErrorCode.TeamDoesNotExist;
    }

    if (this.messageTypeRequiresMembership(message.type)) {
      const membership = storageService.getTeamNameOfParticipant(message.senderUuid);
      if (!membership || teamName !== membership) {
        return EErrorCode.ParticipantNotInTeam;
      }
    }

    if (this.messageTypeForbidsMembership(message.type)) {
      if (storageService.getTeamNameOfParticipant(message.senderUuid)) {
        return EErrorCode.ParticipantAllReadyInTeam;
      }
    }

    if (message.type === EClientMessageType.Leave) {
      const membership = storageService.getTeamNameOfParticipant(message.senderUuid);
      if (message.senderUuid === (<ILeaveMessage>message).data) {
        if (!membership || teamName !== membership) {
          return EErrorCode.ParticipantNotInTeam;
        }
      } else {
        if (membership) {
          return EErrorCode.ParticipantAllReadyInTeam;
        }
      }
    }

    if (message.type === EClientMessageType.ChangeScrumMaster ||
      (message.type === EClientMessageType.Observe && message.senderUuid !== (<IObserveMessage>message).data.member) ||
      (message.type === EClientMessageType.Leave && message.senderUuid !== (<ILeaveMessage>message).data) ||
      message.type === EClientMessageType.Remove) {
      let otherParticipantUuid: string | null;
      switch (message.type) {
        case EClientMessageType.ChangeScrumMaster:
          otherParticipantUuid = (<IChangeScrumMasterMessage>message).data;
          break;
        case EClientMessageType.Leave:
          otherParticipantUuid = (<ILeaveMessage>message).data;
          break;
        case EClientMessageType.Observe:
          otherParticipantUuid = (<IObserveMessage>message).data.member;
          break;
        case EClientMessageType.Remove:
          otherParticipantUuid = (<IRemoveMessage>message).data;
          break;
      }
      if (otherParticipantUuid !== null) {
        const otherParticipant = storageService.participantExists(otherParticipantUuid);
        if (!otherParticipant) {
          return EErrorCode.ParticipantNotFound;
        }
        const teamNameOfOtherParticipant = storageService.getTeamNameOfParticipant(otherParticipantUuid);
        if (!teamNameOfOtherParticipant || teamNameOfOtherParticipant != teamName) {
          return EErrorCode.ParticipantNotInTeam;
        }
      }
    }

    if (message.type === EClientMessageType.Rejoin) {
      const oldUuid = (<IRejoinMessage>message).data;
      if (!storageService.participantExists(oldUuid)) {
        return EErrorCode.ParticipantNotFound;
      } else {
        const oldTeamName = storageService.getTeamNameOfParticipant(oldUuid);
        if (!oldTeamName) {
          return EErrorCode.ParticipantNotInTeam;
        }
        else if (oldTeamName !== teamName) {
          return EErrorCode.ParticipantNotInTeam;
        }
      }
    }

    if (message.type === EClientMessageType.Observe &&
      message.senderUuid !== (<IObserveMessage>message).data.member &&
      sender.role !== ERole.ScrumMaster) {
      return EErrorCode.ScrumMasterRequired;
    }
    else {
      return this.checkAuthorization(message.type, sender);
    }
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private messageTypeRequiresTeam(messageType: EClientMessageType): boolean {
    const result =
      messageType === EClientMessageType.ChangeCardSet ||
      messageType === EClientMessageType.ChangeScrumMaster ||
      messageType === EClientMessageType.Estimate ||
      messageType === EClientMessageType.Join ||
      messageType === EClientMessageType.Leave ||
      messageType === EClientMessageType.Pause ||
      messageType === EClientMessageType.Observe ||
      messageType === EClientMessageType.Reveal ||
      messageType === EClientMessageType.Remove ||
      messageType === EClientMessageType.Rejoin ||
      messageType === EClientMessageType.Start;
    return result;
  }

  private messageTypeRequiresMembership(messageType: EClientMessageType): boolean {
    const result =
      messageType === EClientMessageType.ChangeCardSet ||
      messageType === EClientMessageType.ChangeScrumMaster ||
      messageType === EClientMessageType.Estimate ||
      messageType === EClientMessageType.Observe ||
      messageType === EClientMessageType.Pause ||
      messageType === EClientMessageType.Reveal ||
      messageType === EClientMessageType.Remove ||
      messageType === EClientMessageType.Start;
    return result;
  }

  private messageTypeForbidsMembership(messageType: EClientMessageType): boolean {
    const result =
      messageType === EClientMessageType.Join ||
      messageType === EClientMessageType.Rejoin;
    return result;
  }

  private checkAuthorization(messageType: EClientMessageType, participant: IParticipant): EErrorCode {
    let result: EErrorCode;

    switch (messageType) {
      case EClientMessageType.Estimate:
        result = participant.observer ?
          EErrorCode.ObserverCanNotEstimate :
          EErrorCode.NoError;
        break;
      case EClientMessageType.ChangeCardSet:
      case EClientMessageType.ChangeScrumMaster:
      case EClientMessageType.Remove:
      case EClientMessageType.Reveal:
      case EClientMessageType.Start:
        result = participant.role === ERole.ScrumMaster ?
          EErrorCode.NoError :
          EErrorCode.ScrumMasterRequired;
        break;
      default:
        result = EErrorCode.NoError;
    }
    return result;
  }
  //#endregion
}