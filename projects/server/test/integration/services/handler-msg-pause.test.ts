import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EMemberChangeType, EParticipantStatus, EServerMessageType, IPauseMessage, ISelfMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Pause => OK', () => {
  test('pause', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant
    const scrumMaster =    Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // change nick
    const message: IPauseMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Pause
    };
    participant.sendMessage(message);
    // participant will close his socket as a result of the response
    participant.closeSocket();

    // Test: scrum master 1 should have received create messages + 1 MC join + 1 MC Paused
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Paused)).toBe(1);
    const memberChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberChangeType.Paused);
    expect(memberChangedMessage).toBeDefined();
    if (memberChangedMessage) {
      expect(memberChangedMessage.data.member.status).toBe(EParticipantStatus.Paused);
      expect(memberChangedMessage.data.member.participantId).toBe(participant.participantId);
      expect(memberChangedMessage.data.member.observer).toBe(false);
    }

    // Test: participant 1 should have received 1 self
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.status).toBe(EParticipantStatus.Paused);
      expect(selfMessage.data.participantId).toBe(participant.participantId);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Pause => Failure', () => {
  // TODO 2378 test('team not found', () => { });
  // TODO 2378 test('Sender not found', () => { });
  // TODO 2378 test('Sender not in any team', () => { });
  // TODO 2378 test('Sender in different team', () => { });
  // TODO 2378 test('scrum master may not pause', () => { });
});