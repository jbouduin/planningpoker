import { EServerMessageType } from 'shared-lib';
import type { ITestParticipant } from './TestParticipant.js';
import type { ITestScrumMaster } from './TestScrumMaster.js';

export class UnaffectedTeam {
  public readonly scrumMaster: ITestScrumMaster;
  public readonly participant: ITestParticipant;
  public readonly teamName: string;

  public expectIsUnaffected(): void {
    this.scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.MemberChanged)
      .expectNoMoreMessages();
    this.participant.initializeMessageQueue().expectNoMoreMessages();
  }

  public constructor(scrumMaster: ITestScrumMaster, participant: ITestParticipant, teamName: string) {
    this.scrumMaster = scrumMaster;
    this.participant = participant;
    this.teamName = teamName;
  }
}
