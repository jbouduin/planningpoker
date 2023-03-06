import { ERole } from "../../../../../shared-lib/src";
import { IHandlerService } from "../../../../src/services/interfaces";
import { ATestParticipant, IATestParticipant } from "./ATestParticipant";

export type ITestParticipant = IATestParticipant;

export class TestParticipant extends ATestParticipant implements ITestParticipant {

  public constructor(handlerService: IHandlerService, role = ERole.Developer) {
    super(handlerService, role);
    this.expectedNumberOfInitialMessages = 6;
  }
}