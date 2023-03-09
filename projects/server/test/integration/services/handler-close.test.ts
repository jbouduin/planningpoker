import { describe, expect, test } from '@jest/globals';

import { EClientMessageType, EMemberChangeType, EParticipantStatus, EPokerStatus, ERole, EServerMessageType, IEstimateMessage, IEstimationListMessage, IStartMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";

describe('Close', () => {
  test('A participant disconnects', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer2Name, true);

    // Run: participant disconnects
    participant.closeSocket()

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Disconnected,
        { participantId: participant.participantId, status: EParticipantStatus.Disconnected }
      )
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Disconnected,
        { participantId: participant.participantId, status: EParticipantStatus.Disconnected }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('A participant disconnects after estimating', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer2Name, true);

    // Setup: start estimating
    const startMessage: IStartMessage = {
      senderId: scrumMaster.participantId,
      data: undefined,
      type: EClientMessageType.Start
    };
    scrumMaster.sendMessage(startMessage);

    // Setup: participant estimates
    const estimateMessage: IEstimateMessage = {
      senderId: participant.participantId,
      data: 2,
      type: EClientMessageType.Estimate
    };
    participant.sendMessage(estimateMessage);

    // Run: participant disconnects
    participant.closeSocket()

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsPokerStatus(EPokerStatus.Started)
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => expect(m.data).toHaveLength(1)
      )
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Disconnected,
        { participantId: participant.participantId, status: EParticipantStatus.Disconnected }
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsPokerStatus(EPokerStatus.Started)
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => expect(m.data).toHaveLength(1)
      )
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Disconnected,
        { participantId: participant.participantId, status: EParticipantStatus.Disconnected }
      )
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => expect(m.data).toHaveLength(0)
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIs(EServerMessageType.ClearEstimations)
      .expectNextMessageIsPokerStatus(EPokerStatus.Started)
      .expectNextMessageIs(
        EServerMessageType.EstimationList,
        (m: IEstimationListMessage) => expect(m.data).toHaveLength(1)
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Scrum master disconnects', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two connected and one disconnected participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.observer1Name, true);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant2Nick)

    // Run: scrum master disconnects
    scrumMaster.closeSocket();

    // Test: the 'first' connected participant must be assigned the scrum master role
    // as data is stored in Maps, 'first' will return the participant who has connected 'first'
    // if this changes, tests could fail

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNoMoreMessages();

    // Test: participant (will be the new scrum master) messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsSelf({ role: ERole.ScrumMaster })
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected, { participantId: disconnected.participantId })
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected, { participantId: scrumMaster.participantId })
      .expectNextMessageIsMemberChange(
        EMemberChangeType.ChangedRole,
        {
          participantId: participant.participantId,
          role: ERole.ScrumMaster
        })
      .expectNoMoreMessages();


    // Test: disconnected messages
    disconnected
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('A participant that is in no team disconnects', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Run: participant connects and disconnects
    const participant = Util.connectParticipant(handlerService);
    participant.closeSocket();

    // Test: participant messages
    participant
      .initializeMessageQueue(false)
      .expectNextMessageIsInit();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});