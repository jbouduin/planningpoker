import { IError, EErrorCode, EServerMessageType, IErrorMessage } from "shared-lib";
import { ServerMessage } from "./server-message";

export class ErrorMessage extends ServerMessage<IError> implements IErrorMessage {
  public constructor(code: EErrorCode, errorMessage: string | null = null) {
    const data: IError = {
      code: code,
      message: errorMessage
    };
    super(EServerMessageType.Error, data);
  }
}
