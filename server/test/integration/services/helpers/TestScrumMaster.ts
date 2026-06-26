import type { IHandlerService } from '../../../../src/services/interfaces/index.js';
import { ATestParticipant, IATestParticipant } from './ATestParticipant.js';

export type ITestScrumMaster = IATestParticipant;

export class TestScrumMaster extends ATestParticipant implements ITestScrumMaster {
  public constructor(handlerService: IHandlerService) {
    super(handlerService);
    this.expectedNumberOfInitialMessages = 7;
  }
}
