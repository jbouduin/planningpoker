import { describe, expect, jest, test } from '@jest/globals';

import { EServerMessageType, IInitMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Connect', () => {
  test('Handle connect returns init', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
    const send = jest.fn((_message: string) => Util.noop());
    const socket = Util.getSocket(send);
    handlerService.handleConnect(socket);
    expect(send.mock.calls).toHaveLength(1);
    expect(Util.countMessageType(send.mock.calls, EServerMessageType.Init)).toBe(1);
    const initMessage = Util.extractMessage<IInitMessage>(send.mock.calls, EServerMessageType.Init);
    expect(initMessage).toBeDefined();
    expect(initMessage.data.nick.length).toBeGreaterThan(0);
    expect(initMessage.data.participantId.length).toBeGreaterThan(0);
  });
});