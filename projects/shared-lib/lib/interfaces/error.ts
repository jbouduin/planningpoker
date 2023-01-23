import { ErrorCode } from '../messages';

export interface IError {
  code: ErrorCode,
  message: string | null
}
