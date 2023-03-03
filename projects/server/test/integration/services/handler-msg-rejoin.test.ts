import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EMemberStatusChange, EServerMessageType, IRejoinMessage } from '../../../../shared-lib/src';
import { Util } from "./helpers/util";

describe('Rejoin => OK', () => {
  test('Rejoin after disconnect', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with one disconnected participant
    const scrumMaster =     Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant =  Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant1Nick);

    // create a new connection to rejoin
    const rejoiningParticipant = Util.connectParticipant(handlerService);
    // rejoin
    const message: IRejoinMessage = {
      senderId: rejoiningParticipant.participantId,
      data: participant.participantId,
      type: EClientMessageType.Rejoin
    };
    handlerService.handleMessage(message, Util.team1Name, rejoiningParticipant.socket);

    // test: scrum master 1 should have received 1 MC join + 1 MC disconnected + 1 MC rejoin
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Rejoined)).toBe(1);
    // TODO 2383 check the message contents of the rejoin

    // test: participant 1 should have received no additional messages
    expect(participant.messagesReceivedAfterInitial).toBe(0);

    // test: rejoining participant should have received join messages
    expect(rejoiningParticipant.messagesReceivedAfterInitial).toBe(0);

    // TODO 2383 check if the rejoin messages reflect the current team status

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2383 test('Rejoin after pause', () => { });
  // TODO 2383 test('Rejoin during estimation', () => { });
});


describe('Remove => Failure', () => {
  // TODO 2383 test('Team not found', () => { });
  // TODO 2383 test('Sender not found', () => { });
  // TODO 2383 test('Sender already in a team', () => { });
  // TODO 2383 test('Old participant not found', () => { });
  // TODO 2383 test('Old participant in different team', () => { });
});