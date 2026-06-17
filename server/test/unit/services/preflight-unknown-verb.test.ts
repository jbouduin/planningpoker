import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';

import { AClientMessage, EErrorCode } from '../../../../shared-lib/src';
import { IStorageService } from '../../../src/storage/interfaces';
import { Util } from '../util';

describe('Unknown message type', () => {
  test('Unknown message type', () => {
    const message = { senderId: Util.scrummasterName, data: undefined, type: 'Unknown' };
    const storage = new Mock<IStorageService>()
      .setup((service: IStorageService) => service.getParticipant(Util.scrummasterName))
      .returns(Util.getScrummaster())
      .setup(((service: IStorageService) => service.teamExists(Util.team1Name)))
      .returns(true)
      .setup((service: IStorageService) => service.getTeamOfParticipant(Util.scrummasterName))
      .returns(Util.getTeam1())
      .setup((service: IStorageService) => service.getConnectedTeamMembers(Util.team1Name))
      .returns([Util.getParticipant1(), Util.getParticipant2()]);
    expect(Util.getPreflightService().preflight(storage.object(), <AClientMessage>message, Util.team1Name)).toBe(EErrorCode.UnknownVerb);
  });
});
