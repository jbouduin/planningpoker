import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { EErrorCode, LooseObjectDto } from 'shared-lib';
import type { IHandlerService, ISerializationService } from '../../services/interfaces/index.js';
import SERVICETYPES from '../../services/service.types.js';
import type { IStorageService } from '../../storage/interfaces/index.js';
import STORAGETYPES from '../../storage/storage.types.js';
import type { ISystemController } from '../interfaces/index.js';

@injectable()
export class SystemController implements ISystemController {
  //#region Private properties ------------------------------------------------
  private readonly handlerService: IHandlerService;
  private readonly serializationService: ISerializationService;
  private readonly storageService: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.HandlerService) handlerService: IHandlerService,
    @inject(SERVICETYPES.SerializationService) serializationService: ISerializationService,
    @inject(STORAGETYPES.StorageService) storageService: IStorageService
  ) {
    this.handlerService = handlerService;
    this.serializationService = serializationService;
    this.storageService = storageService;
  }
  //#endregion

  //#region ISystemController methods -----------------------------------------
  public deleteTeam(teamname: string): LooseObjectDto {
    const team = this.storageService.getTeam(teamname);
    const response: LooseObjectDto = {};
    if (team) {
      this.storageService.deleteTeam(teamname);
    } else {
      response.status = EErrorCode.TeamNotFound;
      response.message = 'team not found';
    }
    return response;
  }

  public disconnectParticipant(participantId: string): LooseObjectDto {
    const participant = this.storageService.getParticipant(participantId);
    const response: LooseObjectDto = {};
    if (participant) {
      participant.socket.close();
      response.errorCode = EErrorCode.NoError;
      response.message = 'participant disconnected';
    } else {
      response.status = EErrorCode.ParticipantNotFound;
      response.message = 'participant not found';
    }
    return response;
  }

  public resetServer(): LooseObjectDto {
    return this.handlerService.handleReset();
  }

  public getTeam(teamName: string): LooseObjectDto {
    return this.serializationService.serializeTeam(teamName);
  }

  public getAllTeams(): LooseObjectDto {
    return this.serializationService.serializeAllTeams();
  }

  public getParticipants(): LooseObjectDto {
    return this.serializationService.serializeParticipants();
  }
  //#endregion
}
