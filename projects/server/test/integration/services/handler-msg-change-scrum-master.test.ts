import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { EClientMessageType, EMemberStatusChange, ERole, EServerMessageType, IChangeScrumMasterMessage, ISelfMessage } from '../../../../shared-lib/src';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Change scrum master => OK', () => {
  test('Change scrum master', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with two participants
    const scrumMaster= Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant1= Util.joinTeamNew( handlerService, Util.team1Name, Util.participant1Nick);
    const participant2 = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant2Nick);

    // change scrum master to participant 1
    const message: IChangeScrumMasterMessage = {
      senderId: scrumMaster.participantId,
      data: participant1.participantId,
      type: EClientMessageType.ChangeScrumMaster
    };
    scrumMaster.sendMessage(message);

    // test: scrum master 1 should have received 2 MC join + 1 MC Role change + 1 Self
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMessageType(EServerMessageType.Self)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.ChangedRole)).toBe(1);
    let selfMessage = scrumMaster.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.participantId).toBe(scrumMaster.participantId);
      expect(selfMessage.data.role).toBe(ERole.Developer);
    }
    let roleChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.ChangedRole);
    expect(roleChangedMessage).toBeDefined();
    if (roleChangedMessage) {
      expect(roleChangedMessage.data.member.role).toBe(ERole.ScrumMaster);
      expect(roleChangedMessage.data.memberStatusChange).toBe(EMemberStatusChange.ChangedRole);
      expect(roleChangedMessage.data.member.participantId).toBe(participant1.participantId);
    }

    // test: participant 1 should have received 1 MC join + 1 MC role change + 1 self
    expect(participant1.messagesReceivedAfterInitial).toBe(3);
    expect(participant1.countMessageType(EServerMessageType.Self)).toBe(1);
    expect(participant1.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(participant1.countMemberChangedMessages(EMemberStatusChange.ChangedRole)).toBe(1);
    selfMessage = participant1.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.participantId).toBe(participant1.participantId);
      expect(selfMessage.data.role).toBe(ERole.ScrumMaster);
    }
    roleChangedMessage = participant1.extractMemberChangedMessage(EMemberStatusChange.ChangedRole);
    expect(roleChangedMessage).toBeDefined();
    if (roleChangedMessage) {
      expect(roleChangedMessage.data.member.role).toBe(ERole.Developer);
      expect(roleChangedMessage.data.memberStatusChange).toBe(EMemberStatusChange.ChangedRole);
      expect(roleChangedMessage.data.member.participantId).toBe(scrumMaster.participantId);
    }

    // test: participant 2 should have received 2 MC role changes
    expect(participant2.messagesReceivedAfterInitial).toBe(2);
    expect(participant2.countMemberChangedMessages(EMemberStatusChange.ChangedRole)).toBe(2);

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Change scrum master => Failure', () => {
  // TODO 2376 test('Team not found', () => { });
  // TODO 2376 test('Sender not found', () => { });
  // TODO 2376 test('Sender not scrum master', () => { });
  // TODO 2376 test('Sender not in any team', () => { });
  // TODO 2376 test('Sender in another team', () => { });
  // TODO 2376 test('New scrum master not found', () => { });
  // TODO 2373 test('New Scrum master is not connected', () => {})
  // TODO 2373 test('Sender and new scrum master in different teams', () => { });
});