import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EMemberStatusChange, EServerMessageType, IObserveMessage, ISelfMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";


describe('Toggle observe => OK', () => {
  test('Toggle own observe', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with one participant
    const scrumMaster =     Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant =  Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // change own observer role
    const message: IObserveMessage = {
      senderId: participant.participantId,
      data: {
        member: participant.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    participant.sendMessage(message);

    // Test: scrum master 1 should have received 1 join + 1 MC observe
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Observe)).toBe(1);
    const observeMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Observe);
    expect(observeMessage).toBeDefined();
    if (observeMessage) {
      expect(observeMessage.data.member.observer).toBe(true);
      expect(observeMessage.data.memberStatusChange).toBe(EMemberStatusChange.Observe);
      expect(observeMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: participant 1 should have received 1 self
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.countMessageType(EServerMessageType.Self)).toBe(1);
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.observer).toBe(true);
      expect(selfMessage.data.participantId).toBe(participant.participantId);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Toggle observe for someone else', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // change observer role for someone else
    const message: IObserveMessage = {
      senderId: scrumMaster.participantId,
      data: {
        member: participant.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master 1 should have received 1 MC join + 1 MC observe
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Observe)).toBe(1);
    const observeMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Observe);
    expect(observeMessage).toBeDefined();
    if (observeMessage) {
      expect(observeMessage.data.member.observer).toBe(true);
      expect(observeMessage.data.memberStatusChange).toBe(EMemberStatusChange.Observe);
      expect(observeMessage.data.member.participantId).toBe(participant.participantId);
    }

    // Test: participant 1 should have received 1  self
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.countMessageType(EServerMessageType.Self)).toBe(1);
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.observer).toBe(true);
      expect(selfMessage.data.participantId).toBe(participant.participantId);
    }

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Toggle observe => Failure', () => {
  // TODO 2377 test('Team not found', () => { });
  // TODO 2377 test('Sender not found', () => { });
  // TODO 2377 test('Sender not in any team', () => { });
  // TODO 2377 test('Sender in different team', () => { });
  // TODO 2377 test('Send is not scrum master and changing another participant', () => { });
  // TODO 2377 test('Other participant not found', () => { });
  // TODO 2377 test('Other participant in different team', () => { });
});