import { describe, test } from '@jest/globals';

import { EClientMessageType, EMemberChangeType, IObserveMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import SERVICETYPES from '../../../src/services/service.types';
import { Util } from "./helpers/util";


describe('Toggle observe => OK', () => {
  test('Toggle own observe', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with one participant
    const scrumMaster =     Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant =  Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);
    // change own observer role
    const message: IObserveMessage = {
      senderId: participant.participantId,
      data: {
        member: participant.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    participant.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Observe,
        { participantId: participant.participantId, observer: true }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsSelf(
        { participantId: participant.participantId, observer: true }
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });

  test('Toggle observe for someone else', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // Setup: create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // Setup: create team with participant
    const scrumMaster = Util.createTeam(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeam(handlerService, Util.team1Name, Util.participant1Nick);

    // Setup: change observer role for someone else
    const message: IObserveMessage = {
      senderId: scrumMaster.participantId,
      data: {
        member: participant.participantId,
        observer: true
      },
      type: EClientMessageType.Observe
    };
    scrumMaster.sendMessage(message);

    // Test: scrum master messages
    scrumMaster
      .initializeMessageQueue()
      .expectNextMessageIsMemberChange(EMemberChangeType.Joined)
      .expectNextMessageIsMemberChange(
        EMemberChangeType.Observe,
        { participantId: participant.participantId, observer: true }
      )
      .expectNoMoreMessages();

    // Test: participant messages
    participant
      .initializeMessageQueue()
      .expectNextMessageIsSelf(
        { participantId: participant.participantId, observer: true }
      )
      .expectNoMoreMessages();

    // Test: check if unaffected team is unaffected
    unaffectedTeam.expectIsUnaffected();
  });
});


describe('Toggle observe => Failure', () => {
  // TODO 2377 test('Team not found', () => { });
  // TODO 2377 test('Sender not found', () => { });
  // TODO 2377 test('Sender not in any team', () => { });
  // TODO 2377 test('Sender in different team', () => { });
  // TODO 2377 test('Sender is not scrum master and changing another participant', () => { });
  // TODO 2377 test('Other participant not found', () => { });
  // TODO 2377 test('Other participant in different team', () => { });
});