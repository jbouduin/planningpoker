import { describe, expect, jest, test } from '@jest/globals';

import { EServerMessageType, IInitMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Connect', () => {
  test('Handle connect returns init', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // connect a participant
    const connected = Util.connectParticipant(handlerService);

    // test: init message
    expect(connected.totalMessagesReceived).toBe(1);
    expect(connected.countMessageType(EServerMessageType.Init, false)).toBe(1);
    const initMessage = connected.extractMessage<IInitMessage>(EServerMessageType.Init, false);
    expect(initMessage).toBeDefined();
    if (initMessage) {
      expect(initMessage.data.nick.length).toBeGreaterThan(0);
      expect(initMessage.data.participantId.length).toBeGreaterThan(0);
    }
  });
});