import { describe, test } from '@jest/globals';

import { EClientMessageType, EMemberChangeType, EParticipantStatus, IPauseMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";

describe('Pause => OK', () => {
  test('pause', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Run: pause
    const message: IPauseMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Pause
    };
    participant.sendMessage(message);
    // Run: participant will close his socket as a result of the response
    participant.closeSocket();

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Paused,
        { participantId: participant.participantId, status: EParticipantStatus.Paused }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsSelf({ status: EParticipantStatus.Paused }
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});


describe('Pause => Failure', () => {
  // TODO 2378 test('team not found', () => { });
  // TODO 2378 test('Sender not found', () => { });
  // TODO 2378 test('Sender not in any team', () => { });
  // TODO 2378 test('Sender in different team', () => { });
  // TODO 2378 test('scrum master may not pause', () => { });
});