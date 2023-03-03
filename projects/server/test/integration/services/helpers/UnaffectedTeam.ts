import { ITestParticipant, TestParticipant } from "./TestParticipant";
import { ITestScrumMaster } from "./TestScrumMaster";

export class UnaffectedTeam {
  public readonly scrumMaster: ITestScrumMaster;
  public readonly participant: ITestParticipant;
  public readonly teamName: string;

  public get isUnaffected(): boolean {
    // '1'  as the scrum master will have received the join message of the participant
    return this.scrumMaster.messagesReceivedAfterInitial + this.participant.messagesReceivedAfterInitial === 1;
  }

  public constructor(scrumMaster: ITestScrumMaster, participant: ITestParticipant, teamName: string) {
    this.scrumMaster = scrumMaster;
    this.participant = participant;
    this.teamName = teamName;
  }
}