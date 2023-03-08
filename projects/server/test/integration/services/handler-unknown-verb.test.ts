import { describe, test } from '@jest/globals';

import { AClientMessage, EErrorCode } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";

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
    scrumMaster.sendMessage(<AClientMessage>message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsError(EErrorCode.UnknownVerb)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
})