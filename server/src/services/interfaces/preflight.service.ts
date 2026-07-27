import { AClientMessageDto, EErrorCode } from 'shared-lib';
import type { IStorageService } from '../../storage/interfaces/index.js';

export interface IPreflightService {
  /**
   * Run preflight checks before processing a message.
   *
   * @param storageService - the storage service
   * @param message - the message received from the socket
   * @param requestTeam - the team for which the request was recevied
   *
   * @returns EErrorCode.NoError if preflight is ok, otherwise another error code
   */
  preflight(storageService: IStorageService, message: AClientMessageDto, requestTeam: string): EErrorCode;
}
