import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import SERVICETYPES from '../../services/service.types';
import STORAGETYPES from '../../storage/storage.types';

import { EErrorCode } from 'shared-lib';
import { LooseObject } from '../../objects';
import { IHandlerService, ISerializationService } from '../../services/interfaces';
import { IStorageService } from '../../storage/interfaces';
import { ISystemController } from '../interfaces';

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
  public deleteTeam(teamname: string): LooseObject {
    const team = this.storageService.getTeam(teamname);
    const response: LooseObject = {};
    if (team) {
      this.storageService.deleteTeam(teamname);
    } else {
      response.status = EErrorCode.TeamNotFound;
      response.message = 'team not found';
    }
    return response;
  }

  public disconnectParticipant(participantId: string): LooseObject {
    const participant = this.storageService.getParticipant(participantId);
    const response: LooseObject = {};
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

  public resetServer(): LooseObject {
    return this.handlerService.handleReset();
  }

  public getTeam(teamName: string): LooseObject {
    return this.serializationService.serializeTeam(teamName);
  }

  public getAllTeams(): LooseObject {
    return this.serializationService.serializeAllTeams();
  }

  public getParticipants(): LooseObject {
    return this.serializationService.serializeParticipants();
  }
  //#endregion
}
