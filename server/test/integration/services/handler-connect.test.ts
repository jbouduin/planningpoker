import { describe, test } from '@jest/globals';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { Util } from './helpers/util.js';

describe('Connect', () => {
  test('Handle connect returns init', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Run: connect a participant
    const connected = Util.connectParticipant(handlerService);

    // Test: init message
    connected.initializeMessageQueue(false).expectNextMessageIsInit().expectNoMoreMessages();
  });
});
