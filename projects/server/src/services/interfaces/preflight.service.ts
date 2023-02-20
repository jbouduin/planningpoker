import { AClientMessage, EErrorCode } from "../../../../shared-lib/lib";
import { IStorageService } from "../../storage/interfaces";

export interface IPreflightService {
  preflight(storageService: IStorageService, message: AClientMessage, requestTeam: string): EErrorCode;
}