import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EMemberStatusChange, EParticipantStatus, IRemoveMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";


describe('Remove => OK', () => {
  test('Remove disconnected participant', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with two participants
    const scrumMaster= Util.createTeam( handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);
    const participant = Util.joinTeamAndDisconnect( handlerService, Util.team1Name, Util.participant1Nick);

    // remove the disconnected participant
    const message: IRemoveMessage = {
      senderId: scrumMaster.participantId,
      data: participant.participantId,
      type: EClientMessageType.Remove
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master should have received 2 MC join + 1 MC disconnect + 1 MC left
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Left)).toBe(1);
    let leftMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: observer 1 should have received 1 MC join + 1 MC disconnect + 1 MC left
    expect(observer.messagesReceivedAfterInitial).toBe(3);
    expect(observer.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(observer.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(1);
    expect(observer.countMemberChangedMessages(EMemberStatusChange.Left)).toBe(1);
    leftMessage = observer.extractMemberChangedMessage(EMemberStatusChange.Left);
    expect(leftMessage).toBeDefined();
    if (leftMessage) {
      expect(leftMessage.data.member.status).toBe(EParticipantStatus.Left);
      expect(leftMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: participant 1 should only have received join messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Remove => Failure', () => {
  // TODO 2379 test('Team not found', () => { });
  // TODO 2379 test('Sender not found', () => { });
  // TODO 2379 test('Sender not scrum master', () => { });
  // TODO 2379 test('Sender participant not found', () => { });
  // TODO 2379 test('Sender not in any team', () => { });
  // TODO 2379 test('Sender in different team', () => { });
  // TODO 2379 test('Sender and removed participant in different teams', () => { });
});