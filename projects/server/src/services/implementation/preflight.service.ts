import { injectable } from "inversify";

import { AClientMessage, EClientMessageType, EErrorCode, ERole, ILeaveMessage, IRejoinMessage } from "../../../../shared-lib/lib";
import { IStorageService } from "../../storage/interfaces";
import { IPreflightService } from "../interfaces";

@injectable()
export class PreflightService implements IPreflightService {

  //#region IPreflightService methods -----------------------------------------
  public preflight(storageService: IStorageService, message: AClientMessage, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;

    const participant = storageService.getParticipant(message.senderUuid);
    if (!participant) {
      result = EErrorCode.ParticipantNotFound;
    } else {
      const team = storageService.getTeam(teamName);
      if (message.type === EClientMessageType.Create && team) {
        result = EErrorCode.TeamAlreadyExists;
      } else if (this.messageTypeRequiresTeam(message.type) && !team) {
        result = EErrorCode.TeamDoesNotExist;
      } else if (this.messageTypeRequiresMembership(message.type)) {
        const uuidToUse = message.type === EClientMessageType.Leave ?
          (<ILeaveMessage>message).data : message.senderUuid;
        const membership = storageService.getTeamOfParticipant(uuidToUse);
        if (!membership || membership !== team) {
          result = EErrorCode.ParticipantNotInTeam
        }
      } else if (this.messageTypeForbidsMembership(message.type)) {
        if (storageService.getTeamOfParticipant(message.senderUuid)) {
          result = EErrorCode.ParticipantAllReadyInTeam;
        }
      } else if (message.type === EClientMessageType.Rejoin) {
        const oldUuid = (<IRejoinMessage>message).data;
        if (!storageService.participantExists(oldUuid)) {
          result = EErrorCode.ParticipantNotFound;
        } else {
          const oldTeam = storageService.getTeamOfParticipant(oldUuid);
          if (!oldTeam) { result = EErrorCode.TeamDoesNotExist; }
          else if (oldTeam.teamName !== teamName) {
            result = EErrorCode.ParticipantNotInTeam;
          }
        }
      } else { result = this.checkAuthorization(message.type, participant.role); }
    }
    return result;
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
      messageType === EClientMessageType.Leave ||
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

  private checkAuthorization(messageType: EClientMessageType, role: ERole): EErrorCode {
    let result = EErrorCode.NoError;

    switch (messageType) {
      // TODO is this correct ???
      case (EClientMessageType.Estimate): {
        if (role !== ERole.ScrumMaster && role !== ERole.Developer) {
          result = EErrorCode.DeveloperRequired;
        }
        break;
      }
      case (EClientMessageType.ChangeCardSet):
      case (EClientMessageType.ChangeScrumMaster):
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
  //#endregion
}