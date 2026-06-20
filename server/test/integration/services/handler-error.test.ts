import { describe, test } from '@jest/globals';

import { EServerMessageType, IErrorMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from './helpers/util';

describe('Handle Error', () => {
  test('Handle error ', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);

    // Run: raise an error
    handlerService.handleError(scrumMaster.socket, new Error('test error'));

    // Test scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.Error, (m: IErrorMessage) => m.data.message === 'test error')
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});
