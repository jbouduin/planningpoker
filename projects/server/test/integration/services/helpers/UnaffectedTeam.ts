import { EServerMessageType } from "../../../../../shared-lib/src";
import { ITestParticipant } from "./TestParticipant";
import { ITestScrumMaster } from "./TestScrumMaster";

export class UnaffectedTeam {
  public readonly scrumMaster: ITestScrumMaster;
  public readonly participant: ITestParticipant;
  public readonly teamName: string;

  /**
   * @deprecated use the message iterator to validate messages
   */
  public get isUnaffected(): boolean {
    // '1'  as the scrum master will have received the join message of the participant
    return this.scrumMaster.messagesReceivedAfterInitial + this.participant.messagesReceivedAfterInitial === 1;
  }

  public expectIsUnaffected(): void {
    this.scrumMaster.initializeMessageIterator();
    this.scrumMaster.expectNextMessageIs(EServerMessageType.MemberChanged);
    this.scrumMaster.expectNoMoreMessages();
    this.participant.initializeMessageIterator();
    this.participant.expectNoMoreMessages();
  }

  public constructor(scrumMaster: ITestScrumMaster, participant: ITestParticipant, teamName: string) {
    this.scrumMaster = scrumMaster;
    this.participant = participant;
    this.teamName = teamName;
  }
}