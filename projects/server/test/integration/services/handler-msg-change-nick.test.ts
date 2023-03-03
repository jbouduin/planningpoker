import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EMemberChangeType, EServerMessageType, IChangeNickMessage, ISelfMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";


describe('Change nick => OK', () => {
  test('Change nick', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with one connected and one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant2Nick);

    // scrum master changes his nick
    const message: IChangeNickMessage = {
      senderId: scrumMaster.participantId,
      data: Util.observer1Name,
      type: EClientMessageType.ChangeNick
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master should have received 2 MC join + 1 MC disconnect + 1 self
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.Self)).toBe(1);
    const selfMessage = scrumMaster.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.nick).toBe(Util.observer1Name);
    }

    // Test: participant should have received 1 MC join + 1 MC disconnect + 1 MC nick change
    expect(participant.messagesReceivedAfterInitial).toBe(3);
    expect(participant.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(1);
    expect(participant.countMemberChangedMessages(EMemberChangeType.Disconnected)).toBe(1);
    expect(participant.countMemberChangedMessages(EMemberChangeType.ChangedNick)).toBe(1);
    const memberChangeMessage = participant.extractMemberChangedMessage(EMemberChangeType.ChangedNick, true);
    expect(memberChangeMessage).toBeDefined();
    if (memberChangeMessage) {
      expect(memberChangeMessage.data.member.nick).toBe(Util.observer1Name);
      expect(memberChangeMessage.data.memberStatusChange).toBe(EMemberChangeType.ChangedNick);
      expect(memberChangeMessage.data.member.participantId).toBe(scrumMaster.participantId);
    }

    // Test: disconnected participant should not have received any additional message
    expect(disconnected.messagesReceivedAfterInitial).toBe(0);

    // Test: check if unaffected team is unaffected
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Change nick => Failure', () => {
  // TODO 2375 test('Team not found', () => { });
  // TODO 2375 test('Sender not found', () => { });
  // TODO 2375 test('Sender not in any team', () => { });
  // TODO 2375 test('Sender in different team', () => { });
  // TODO 2372 test('nick is null or empty', () => { });
});