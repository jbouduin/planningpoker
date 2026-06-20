import { IHandlerService } from '../../../../src/services/interfaces';
import { ATestParticipant, IATestParticipant } from './ATestParticipant';

export type ITestScrumMaster = IATestParticipant;

export class TestScrumMaster extends ATestParticipant implements ITestScrumMaster {
  public constructor(handlerService: IHandlerService) {
    super(handlerService);
    this.expectedNumberOfInitialMessages = 6;
  }
}
