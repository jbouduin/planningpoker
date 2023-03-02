import { expect, jest, test } from '@jest/globals';

import { EErrorCode, EServerMessageType, IErrorMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./util";

test('Handle error', () => {
  const container = Util.getContainer();
  const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);
  // create team 1
  const scrumMaster1Send = jest.fn((_message: string) => Util.noop());
  const scrumMaster1Socket = Util.getSocket(scrumMaster1Send);
  Util.createTeam(scrumMaster1Socket, handlerService, Util.team1Name, Util.scrumMaster1Nick);
  handlerService.handleError(scrumMaster1Socket, new Error('test error'));
  // test
  expect(scrumMaster1Send).toBeCalledTimes(Util.expectedMessagesCreate + 1);
  expect(Util.errorMessageReceived(scrumMaster1Send.mock.calls, EErrorCode.ServerError)).toBe(true);
  expect(Util.extractMessage<IErrorMessage>(scrumMaster1Send.mock.calls, EServerMessageType.Error).data.message).toBe('test error');
});
