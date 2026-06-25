import { EErrorCode } from './error-code.enum';

export interface ErrorDto {
  code: EErrorCode;
  message: string | null;
}
