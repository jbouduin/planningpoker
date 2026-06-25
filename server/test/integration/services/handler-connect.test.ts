import { describe, test } from '@jest/globals';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from './helpers/util';

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
