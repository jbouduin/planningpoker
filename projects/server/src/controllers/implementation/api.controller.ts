import { inject, injectable } from "inversify";

import STORAGETYPES from "../../storage/storage.types";
import SERVICETYPES from "../../services/service.types";

import { IStorageService } from "../../storage/interfaces";
import { ECardSet, EErrorCode, ICardSet } from "../../../../shared-lib/lib";
import { LooseObject } from "../../objects";
import { IApiController } from "../interfaces";
import { ICardService } from "services/interfaces";

@injectable()
export class ApiController implements IApiController {

  //#region Private properties ------------------------------------------------
  private readonly cardService: ICardService;
  private readonly storageService: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.CardService) cardService: ICardService,
    @inject(STORAGETYPES.StorageService) storageService: IStorageService) {
    this.cardService = cardService;
    this.storageService = storageService;
  }
  //#endregion

  //#region IApiController methods --------------------------------------------
  public canRejoin(teamName: string, uuid: string): LooseObject {
    console.log(`check if ${uuid} can rejoin ${teamName}:`);
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
    console.log(JSON.stringify(response));
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