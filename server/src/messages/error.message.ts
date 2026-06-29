import { EErrorCode, EServerMessageType, ErrorDto, ErrorMessageDto } from 'shared-lib';
import { ServerMessage } from './server.message.js';

export class ErrorMessage extends ServerMessage<ErrorDto> implements ErrorMessageDto {
  public constructor(code: EErrorCode, errorMessage: string | null = null) {
    const data: ErrorDto = {
      code: code,
      message: errorMessage
    };
    super(EServerMessageType.Error, data);
  }
}
