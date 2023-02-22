import { inject, injectable } from "inversify";

import STORAGETYPES from "../../storage/storage.types";
import SERVICETYPES from "../../services/service.types";

import { IStorageService } from "../../storage/interfaces";
import { ECardSet, EErrorCode, ICardSet } from "../../../../shared-lib/lib";
import { LooseObject } from "../../objects";
import { IApiController } from "../interfaces";
import { ICardService, ILoggerService } from "../../services/interfaces";

@injectable()
export class ApiController implements IApiController {

  //#region Private properties ------------------------------------------------
  private readonly cardService: ICardService;
  private readonly loggerService: ILoggerService;
  private readonly storageService: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.CardService) cardService: ICardService,
    @inject(SERVICETYPES.LoggerService) loggerService: ILoggerService,
    @inject(STORAGETYPES.StorageService) storageService: IStorageService) {
    this.cardService = cardService;
    this.loggerService = loggerService;
    this.storageService = storageService;
  }
  //#endregion

  //#region IApiController methods --------------------------------------------
  public canRejoin(teamName: string, uuid: string): LooseObject {
    const response: LooseObject = {};
    response.errorCode = this.storageService.canRejoin(uuid, teamName);
    switch (response.errorCode) {
      case EErrorCode.TeamDoesNotExist:
        response.canRejoin = false;
        response.message = 'team does not exist';
        break;
      case EErrorCode.ParticipantNotFound:
        response.canRejoin = false;
        response.message = 'participant does not exist';
        break;
      case EErrorCode.ParticipantNotInTeam:
        response.canRejoin = false;
        response.message = 'participant is not a teammember';
        break;
      default:
        response.canRejoin = true
    }
    this.loggerService.info('Server', `check if ${uuid} can rejoin ${teamName}: ${JSON.stringify(response)}`);
    return response;
  }

  public availableCardSets(): Array<ICardSet> {
    return [
      this.cardService.getCardSet(ECardSet.Cohn),
      this.cardService.getCardSet(ECardSet.Fibonacci),
      this.cardService.getCardSet(ECardSet.TShirt)
    ];
  }
  //#endregion
}