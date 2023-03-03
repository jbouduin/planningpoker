import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EMemberStatusChange, EServerMessageType, IEstimateMessage, IEstimationsMessage, IStartMessage } from '../../../../shared-lib/src';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";


describe('Estimate => OK', () => {
  test('Give estimation', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with one participant
    const scrumMaster= Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant= Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);

    // start estimation
    const message: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(message);

    // estimate
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // test: scrum master 1 should have received 1 MC join + 1 clear + 1 pokerstatus + 1 estimation list
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(scrumMaster.countMessageType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(scrumMaster.countMessageType(EServerMessageType.PokerStatus)).toBe(1);
    expect(scrumMaster.countMessageType(EServerMessageType.EstimationList)).toBe(1);
    let estimationListMessage = scrumMaster.extractMessage<IEstimationsMessage>(EServerMessageType.EstimationList);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(1);
      expect(estimationListMessage.data[0].participantId).toBe(participant.participantId);
        // TODO 2383 remove 999 to indicate that we do not want to send the estimated value
      expect(estimationListMessage.data[0].cardIndex).toBe(999);
      expect(estimationListMessage.data[0].revealed).toBe(false);
    }

    // test: participant should have received 1 clear + 1 pokerstatus + 1 additional estimation list
    expect(participant.messagesReceivedAfterInitial).toBe(3);
    expect(participant.countMessageType(EServerMessageType.ClearEstimations)).toBe(1);
    expect(participant.countMessageType(EServerMessageType.PokerStatus)).toBe(1);
    expect(participant.countMessageType(EServerMessageType.EstimationList)).toBe(1);
    estimationListMessage = participant.extractMessage<IEstimationsMessage>(EServerMessageType.EstimationList);
    expect(estimationListMessage).toBeDefined();
    if (estimationListMessage) {
      expect(estimationListMessage.data).toHaveLength(1);
      expect(estimationListMessage.data[0].participantId).toBe(participant.participantId);
      expect(estimationListMessage.data[0].cardIndex).toBe(2);
      expect(estimationListMessage.data[0].revealed).toBe(true);
    }

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  // TODO 2380 test('Withdraw estimation', () => { });
  // TODO 2380 test('Update estimation', () => { });
});


describe('Estimate => Failure', () => {
  // TODO 2380 test('Team not found', () => { });
  // TODO 2380 test('Sender not found', () => { });
  // TODO 2380 test('Sender not in any team', () => { });
  // TODO 2380 test('Sender in different team', () => { });
  // TODO 2371 test('poker status is not started', () => { });
  // TODO 2380 test('Sender is observer', () => { });
  // TODO 2380 test('Card index out of range', () => { });
});