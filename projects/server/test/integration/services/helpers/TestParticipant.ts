import { IHandlerService } from "../../../../src/services/interfaces";
import { ATestParticipant, IATestParticipant } from "./ATestParticipant";

export type ITestParticipant = IATestParticipant;

export class TestParticipant extends ATestParticipant implements ITestParticipant {

  public constructor(handlerService: IHandlerService) {
    super(handlerService);
    this.expectedNumberOfInitialMessages = 6;
  }
}