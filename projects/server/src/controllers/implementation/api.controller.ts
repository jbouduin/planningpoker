import { inject, injectable } from "inversify";

import STORAGETYPES from "../../storage/storage.types";

import { IStorageService } from "../../storage/interfaces";
import { EErrorCode } from "../../../../shared-lib/lib";
import { LooseObject } from "../../objects";
import { IApiController } from "../interfaces";

@injectable()
export class ApiController implements IApiController {

  //#region Private properties ------------------------------------------------
  private readonly storageService: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(STORAGETYPES.StorageService) storageService: IStorageService) {
    this.storageService = storageService;
  }
  //#endregion

  //#region IApiController methods --------------------------------------------
  public canRejoin(teamName: string, uuid: string): LooseObject {
    console.log(`check if ${uuid} can rejoin ${teamName}`);
    const response: LooseObject = {};
    response.errorCode = this.storageService.canRejoin(uuid, teamName);
    switch (response.canRejoin) {
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
    return response;
  }
  //#endregion
}