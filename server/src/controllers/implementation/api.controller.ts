import { inject, injectable } from 'inversify';
import { CanRejoinDto, CardSetDto, ECardSetType, EErrorCode } from 'shared-lib';
import type { ILoggerService } from '../../services/interfaces/index.js';
import SERVICETYPES from '../../services/service.types.js';
import type { IFactoryService, IStorageService } from '../../storage/interfaces/index.js';
import STORAGETYPES from '../../storage/storage.types.js';
import type { IApiController } from '../interfaces/index.js';

@injectable()
export class ApiController implements IApiController {
  //#region Private properties ------------------------------------------------
  private readonly factoryService: IFactoryService;
  private readonly loggerService: ILoggerService;
  private readonly storageService: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(STORAGETYPES.FactoryService) factoryService: IFactoryService,
    @inject(SERVICETYPES.LoggerService) loggerService: ILoggerService,
    @inject(STORAGETYPES.StorageService) storageService: IStorageService
  ) {
    this.factoryService = factoryService;
    this.loggerService = loggerService;
    this.storageService = storageService;
  }
  //#endregion

  //#region IApiController methods --------------------------------------------
  public canRejoin(teamName: string, participantId: string): CanRejoinDto {
    let response: CanRejoinDto;
    const errorCode = this.storageService.canRejoin(participantId, teamName);
    switch (errorCode) {
      case EErrorCode.TeamNotFound:
        response = {
          canRejoin: false,
          message: 'team does not exist'
        };
        break;
      case EErrorCode.ParticipantNotFound:
        response = {
          canRejoin: false,
          message: 'participant does not exist'
        };
        break;
      case EErrorCode.ParticipantNotInTeam:
        response = {
          canRejoin: false,
          message: 'participant is not a teammember'
        };
        break;
      default:
        response = {
          canRejoin: true,
          message: ''
        };
    }
    this.loggerService.info('Server', `check if ${participantId} can rejoin ${teamName}: ${JSON.stringify(response)}`);
    return response;
  }

  public availableCardSets(): Array<CardSetDto> {
    return [
      this.factoryService.createCardSet(ECardSetType.Cohn),
      this.factoryService.createCardSet(ECardSetType.Fibonacci),
      this.factoryService.createCardSet(ECardSetType.TShirt)
    ];
  }
  //#endregion
}
