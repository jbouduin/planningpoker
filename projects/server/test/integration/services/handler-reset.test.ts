import { describe, expect, jest, test } from '@jest/globals';

import { EClientMessageType, EMemberStatusChange, EServerMessageType, IPauseMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Reset', () => {
  test('Handle reset', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    // create team with one connected, one paused participant and a connected observer
    const scrumMaster =    Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant =    Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    const paused = Util.joinTeamAndPause(handlerService, Util.team1Name, Util.participant2Nick);
    const observer = Util.joinTeamNew(handlerService, Util.team1Name, Util.observer2Name, true);

    // reset the server
    handlerService.handleReset();

    // test: scrum master should have received 3 MC join + 1 MC pause + 1 reset
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(5);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Paused)).toBe(1);
    expect(scrumMaster.countMessageType(EServerMessageType.ServerReset)).toBe(1);

    // test: participant should have received 2 MC joins + 1 MC pause + 1 reset
    expect(participant.messagesReceivedAfterInitial).toBe(4);
    expect(participant.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(2);
    expect(participant.countMemberChangedMessages(EMemberStatusChange.Paused)).toBe(1);
    expect(participant.countMessageType(EServerMessageType.ServerReset)).toBe(1);

    // test: paused participant should have received 1 self (pause)
    expect(paused.messagesReceivedAfterInitial).toBe(1);
    expect(paused.countMessageType(EServerMessageType.Self)).toBe(1);

    // test: observer should have received 1 reset
    expect(observer.messagesReceivedAfterInitial).toBe(1);
    expect(observer.countMessageType(EServerMessageType.ServerReset)).toBe(1);
  });
});