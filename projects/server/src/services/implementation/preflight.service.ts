import { injectable } from "inversify";

import { AClientMessage, EClientMessageType, EErrorCode, ERole, IChangeScrumMasterMessage, ILeaveMessage, IObserveMessage, IParticipant, IRejoinMessage, IRemoveMessage } from "../../../../shared-lib/src";
import { IStorageService } from "../../storage/interfaces";
import { IPreflightService } from "../interfaces";

@injectable()
export class PreflightService implements IPreflightService {

  //#region IPreflightService methods -----------------------------------------
  public preflight(storageService: IStorageService, message: AClientMessage, teamName: string): EErrorCode {

    const sender = storageService.getParticipant(message.senderId);
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
      const membership = storageService.getTeamOfParticipant(message.senderId);
      if (!membership || teamName !== membership.teamName) {
        return EErrorCode.ParticipantNotInTeam;
      }
    }

    if (this.messageTypeForbidsMembership(message.type)) {
      if (storageService.getTeamOfParticipant(message.senderId)) {
        return EErrorCode.ParticipantAllReadyInTeam;
      }
    }

    if (message.type === EClientMessageType.Leave) {
      const membership = storageService.getTeamOfParticipant(message.senderId);
      if (message.senderId === (<ILeaveMessage>message).data) {
        if (!membership || teamName !== membership.teamName) {
          return EErrorCode.ParticipantNotInTeam;
        }
      } else {
        if (membership) {
          return EErrorCode.ParticipantAllReadyInTeam;
        }
      }
    }

    if (message.type === EClientMessageType.ChangeScrumMaster ||
      (message.type === EClientMessageType.Observe && message.senderId !== (<IObserveMessage>message).data.member) ||
      (message.type === EClientMessageType.Leave && message.senderId !== (<ILeaveMessage>message).data) ||
      message.type === EClientMessageType.Remove) {
      let otherParticipantId: string | null;
      switch (message.type) {
        case EClientMessageType.ChangeScrumMaster:
          otherParticipantId = (<IChangeScrumMasterMessage>message).data;
          break;
        case EClientMessageType.Leave:
          otherParticipantId = (<ILeaveMessage>message).data;
          break;
        case EClientMessageType.Observe:
          otherParticipantId = (<IObserveMessage>message).data.member;
          break;
        case EClientMessageType.Remove:
          otherParticipantId = (<IRemoveMessage>message).data;
          break;
      }
      if (otherParticipantId !== null) {
        const otherParticipant = storageService.participantExists(otherParticipantId);
        if (!otherParticipant) {
          return EErrorCode.ParticipantNotFound;
        }
        const teamOfOtherParticipant = storageService.getTeamOfParticipant(otherParticipantId);
        if (!teamOfOtherParticipant || teamOfOtherParticipant.teamName != teamName) {
          return EErrorCode.ParticipantNotInTeam;
        }
      }
    }

    if (message.type === EClientMessageType.Rejoin) {
      const oldParticipantId = (<IRejoinMessage>message).data;
      if (!storageService.participantExists(oldParticipantId)) {
        return EErrorCode.ParticipantNotFound;
      } else {
        const oldTeamName = storageService.getTeamOfParticipant(oldParticipantId);
        if (!oldTeamName) {
          return EErrorCode.ParticipantNotInTeam;
        }
        else if (oldTeamName.teamName !== teamName) {
          return EErrorCode.ParticipantNotInTeam;
        }
      }
    }

    if (message.type === EClientMessageType.Observe &&
      message.senderId !== (<IObserveMessage>message).data.member &&
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