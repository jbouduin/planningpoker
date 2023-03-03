import { TestParticipant } from "./TestParticipant";

export class UnaffectedTeam {
  public readonly scrumMaster: TestParticipant;
  public readonly participant: TestParticipant;
  public readonly teamName: string;

  public get isUnaffected(): boolean {
    // '-1'  as the scrum master will have received the join message of the participant
    return this.scrumMaster.numberOfCallsAfterCreate - 1 + this.participant.numberOfCallsAfterJoin === 0;
  }

  public constructor(scrumMaster: TestParticipant, participant: TestParticipant, teamName: string) {
    this.scrumMaster = scrumMaster;
    this.participant = participant;
    this.teamName = teamName;
  }
}