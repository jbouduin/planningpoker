import { describe, test } from '@jest/globals';

import { EClientMessageType, EMemberChangeType, EParticipantStatus, IRemoveMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";


describe('Remove => OK', () => {
  test('Remove disconnected participant', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with two participants
    const scrumMaster= Util.createTeam( handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const observer = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick, true);
    const participant = Util.joinTeamAndDisconnect( handlerService, Util.team1Name, Util.participant1Nick);

    // Run: remove the disconnected participant
    const message: IRemoveMessage = {
      senderId: scrumMaster.participantId,
      data: participant.participantId,
      type: EClientMessageType.Remove
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Left,
        { participantId: participant.participantId, status: EParticipantStatus.Left }
      )
      .expectNoMoreMessages();

    // Test: observer messages
    observer
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(EMemberChangeType.Disconnected)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Left,
        { participantId: participant.participantId, status: EParticipantStatus.Left }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});


describe('Remove => Failure', () => {
  // TODO 2379 test('Team not found', () => { });
  // TODO 2379 test('Sender not found', () => { });
  // TODO 2379 test('Sender not scrum master', () => { });
  // TODO 2379 test('Sender participant not found', () => { });
  // TODO 2379 test('Sender not in any team', () => { });
  // TODO 2379 test('Sender in different team', () => { });
  // TODO 2379 test('Sender and removed participant in different teams', () => { });
});