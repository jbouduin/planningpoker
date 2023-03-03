import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { IHandlerService } from '../../../src/services/interfaces';

import { EClientMessageType, EMemberStatusChange, EParticipantStatus, EServerMessageType, IMemberChangedMessage, IPauseMessage, ISelfMessage } from '../../../../shared-lib/src';
import { Util } from "./helpers/util";


describe('Pause => OK', () => {
  test('pause', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with participant
    const scrumMaster =    Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    // change nick
    const message: IPauseMessage = {
      senderId: participant.participantId,
      data: undefined,
      type: EClientMessageType.Pause
    };
    handlerService.handleMessage(message, Util.team1Name, participant.socket);
    // participant will close his socket as a result of the response
    handlerService.handleClose(participant.socket);

    // test: scrum master 1 should have received create messages + 1 MC join + 1 MC Paused
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Paused)).toBe(1);
    const memberChangedMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Paused);
    expect(memberChangedMessage).toBeDefined();
    if (memberChangedMessage) {
      expect(memberChangedMessage.data.member.status).toBe(EParticipantStatus.Paused);
      expect(memberChangedMessage.data.member.participantId).toBe(participant.participantId);
      expect(memberChangedMessage.data.member.observer).toBe(false);
    }

    // test: participant 1 should have received 1 self
    const selfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self);
    expect(selfMessage).toBeDefined();
    if (selfMessage) {
      expect(selfMessage.data.status).toBe(EParticipantStatus.Paused);
      expect(selfMessage.data.participantId).toBe(participant.participantId);
    }

    // test unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Pause => Failure', () => {
  // TODO 2378 test('team not found', () => { });
  // TODO 2378 test('Sender not found', () => { });
  // TODO 2378 test('Sender not in any team', () => { });
  // TODO 2378 test('Sender in different team', () => { });
  // TODO 2378 test('scrum master may not pause', () => { });
});