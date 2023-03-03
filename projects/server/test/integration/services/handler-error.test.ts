import { describe, expect, jest, test } from '@jest/globals';

import { EErrorCode, EServerMessageType, IErrorMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Handle Error', () => {
  test('Handle error ', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team
    const scrumMaster = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // raise an error
    handlerService.handleError(scrumMaster.socket, new Error('test error'));

    // test
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(1);
    expect(scrumMaster.errorMessageReceived(EErrorCode.ServerError)).toBe(true);
    const errorMessage = scrumMaster.extractMessage<IErrorMessage>(EServerMessageType.Error);
    expect(errorMessage).toBeDefined();
    if (errorMessage) {
      expect(errorMessage.data.message).toBe('test error');
    }

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});