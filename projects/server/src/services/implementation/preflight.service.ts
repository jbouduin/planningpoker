import { injectable } from "inversify";

import { ClientMessage, EClientMessageType, EErrorCode, ERole, IRejoinMessage } from "../../../../shared-lib/lib";
import { IStorageService } from "../../storage/interfaces";
import { IPreflightService } from "../interfaces";

@injectable()
export class PreflightService implements IPreflightService {

  public preflight(storageService: IStorageService, message: ClientMessage, teamName: string): EErrorCode {
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
        const membership = storageService.getTeamOfParticipant(message.senderUuid);
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

  private messageTypeRequiresTeam(messageType: EClientMessageType): boolean {
    const result =
      messageType === EClientMessageType.Estimate ||
      messageType === EClientMessageType.Join ||
      messageType === EClientMessageType.Leave ||
      messageType === EClientMessageType.Reveal ||
      messageType === EClientMessageType.Start;
    return result;
  }

  private messageTypeRequiresMembership(messageType: EClientMessageType): boolean {
    const result =
      messageType === EClientMessageType.Estimate ||
      messageType === EClientMessageType.Leave ||
      messageType === EClientMessageType.Pause ||
      messageType === EClientMessageType.Reveal ||
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
}