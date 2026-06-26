import { ERole } from 'shared-lib';
import type { IHandlerService } from '../../../../src/services/interfaces/index.js';
import { ATestParticipant, IATestParticipant } from './ATestParticipant.js';

export type ITestParticipant = IATestParticipant;

export class TestParticipant extends ATestParticipant implements ITestParticipant {
  public constructor(handlerService: IHandlerService, role = ERole.Developer) {
    super(handlerService, role);
    this.expectedNumberOfInitialMessages = 8;
  }
}
