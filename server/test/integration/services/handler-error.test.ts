import { describe, test } from '@jest/globals';
import { EServerMessageType, IErrorMessage } from 'shared-lib';
import type { IHandlerService } from '../../../src/services/interfaces/index.js';
import SERVICETYPES from '../../../src/services/service.types.js';
import { Util } from './helpers/util.js';

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
