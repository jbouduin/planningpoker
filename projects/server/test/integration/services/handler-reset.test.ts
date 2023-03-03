import { describe, expect, test } from '@jest/globals';

import { EMemberChangeType, EServerMessageType } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Reset', () => {
  test('Handle reset', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team with one connected, one paused participant and a connected observer
    const scrumMaster =    Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant =    Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const paused = Util.joinTeamAndPause(handlerService, Util.team1Name, Util.participant2Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer2Name, true);

    // reset the server
    handlerService.handleReset();

    // Test: scrum master should have received 3 MC join + 1 MC pause + 1 reset
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(5);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberChangeType.Paused)).toBe(1);
    expect(scrumMaster.countMessagesOfType(EServerMessageType.ServerReset)).toBe(1);

    // Test: participant should have received 2 MC joins + 1 MC pause + 1 reset
    expect(participant.messagesReceivedAfterInitial).toBe(4);
    expect(participant.countMemberChangedMessages(EMemberChangeType.Joined)).toBe(2);
    expect(participant.countMemberChangedMessages(EMemberChangeType.Paused)).toBe(1);
    expect(participant.countMessagesOfType(EServerMessageType.ServerReset)).toBe(1);

    // Test: paused participant should have received 1 self (pause)
    expect(paused.messagesReceivedAfterInitial).toBe(1);
    expect(paused.countMessagesOfType(EServerMessageType.Self)).toBe(1);

    // Test: observer should have received 1 reset
    expect(observer.messagesReceivedAfterInitial).toBe(1);
    expect(observer.countMessagesOfType(EServerMessageType.ServerReset)).toBe(1);
  });
});