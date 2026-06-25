import { EErrorCode, EServerMessageType, ErrorDto, IErrorMessage } from 'shared-lib';
import { ServerMessage } from './server-message';

export class ErrorMessage extends ServerMessage<ErrorDto> implements IErrorMessage {
  public constructor(code: EErrorCode, errorMessage: string | null = null) {
    const data: ErrorDto = {
      code: code,
      message: errorMessage
    };
    super(EServerMessageType.Error, data);
  }
}
