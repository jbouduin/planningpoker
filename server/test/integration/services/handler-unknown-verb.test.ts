import { describe, test } from '@jest/globals';
import { AClientMessageDto, EErrorCode } from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { Util } from './helpers/util.js';

describe('Unknown message type', () => {
  test('send unknown message type', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // Run: send a message with an unknown verb (MessageType)
    const message = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: 'Unknown'
    };
    scrumMaster.sendMessage(<AClientMessageDto>message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.UnknownClientMessageType)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
