import { ErrorCode } from '../messages';

export interface DtoError {
  code: ErrorCode,
  message: string | null
}
