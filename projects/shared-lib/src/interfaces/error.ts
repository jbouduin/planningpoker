import { EErrorCode } from '../messages';

export interface IError {
  code: EErrorCode,
  message: string | null
}
