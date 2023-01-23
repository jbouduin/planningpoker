import { DtoError, ErrorCode, ServerMessageType, IErrorMessage } from "../../../shared-lib/lib";
import { ServerMessage } from "./server.message";

export class ErrorMessage extends ServerMessage<DtoError> implements IErrorMessage {
  public constructor(code: ErrorCode, errorMessage: string | null = null) {
    const data: DtoError = {
      code: code,
      message: errorMessage
    };
    super(ServerMessageType.Error, data);
  }
}