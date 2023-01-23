import { IError, ErrorCode, ServerMessageType, IErrorMessage } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class ErrorMessage extends ServerMessage<IError> implements IErrorMessage {
  public constructor(code: ErrorCode, errorMessage: string | null = null) {
    const data: IError = {
      code: code,
      message: errorMessage
    };
    super(ServerMessageType.Error, data);
  }
}