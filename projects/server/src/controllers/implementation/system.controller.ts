import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import SERVICETYPES from '../../services/service.types';
import STORAGETYPES from '../../storage/storage.types';

import { EErrorCode } from '../../../../shared-lib/src';
import { LooseObject } from '../../objects';
import { IHandlerService } from '../../services/interfaces';
import { IStorageService } from '../../storage/interfaces';
import { ISystemController } from '../interfaces';

@injectable()
export class SystemController implements ISystemController {

  //#region Private properties ------------------------------------------------
  private readonly handlerService: IHandlerService;
  private readonly storageService: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.HandlerService) HandlerService: IHandlerService,
    @inject(STORAGETYPES.StorageService) storageService: IStorageService) {
    this.handlerService = HandlerService;
    this.storageService = storageService;
  }
  //#endregion

  //#region ISystemController methods -----------------------------------------
  public disconnectParticipant(uuid: string): LooseObject {
    const participant = this.storageService.getParticipant(uuid);
    const response: LooseObject = {}
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
    return this.storageService.serializeTeam(teamName);
  }

  public getAllTeams(): LooseObject {
    return this.storageService.serializeAllTeams();

  }

  public getParticipants(): LooseObject {
    return this.storageService.serializeParticipants();
  }
  //#endregion
}
