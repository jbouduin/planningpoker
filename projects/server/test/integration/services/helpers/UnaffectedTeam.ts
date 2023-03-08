import { EServerMessageType } from "../../../../../shared-lib/src";
import { ITestParticipant } from "./TestParticipant";
import { ITestScrumMaster } from "./TestScrumMaster";

export class UnaffectedTeam {
  public readonly scrumMaster: ITestScrumMaster;
  public readonly participant: ITestParticipant;
  public readonly teamName: string;

  public expectIsUnaffected(): void {
    this.scrumMaster.initializeMessageQueue();
    this.scrumMaster.expectNextMessageIs(EServerMessageType.MemberChanged);
    this.scrumMaster.expectNoMoreMessages();
    this.participant.initializeMessageQueue();
    this.participant.expectNoMoreMessages();
  }

  public constructor(scrumMaster: ITestScrumMaster, participant: ITestParticipant, teamName: string) {
    this.scrumMaster = scrumMaster;
    this.participant = participant;
    this.teamName = teamName;
  }
}