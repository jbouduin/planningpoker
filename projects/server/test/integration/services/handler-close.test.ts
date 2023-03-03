import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { EMemberStatusChange, EParticipantStatus, ERole, EServerMessageType, ISelfMessage } from '../../../../shared-lib/src';
import { IHandlerService } from '../../../src/services/interfaces';
import { Util } from "./helpers/util";

describe('Close', () => {
  test('A participant disconnects', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with two participants
    const scrumMaster =    Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeamNew(handlerService, Util.team1Name, Util.observer2Name, true);

    // participant disconnects
    participant.closeSocket()

    // test: scrum master should have received create messages + 2 MC join + 1 MC disconnect
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(1);
    let disconnectMessage = scrumMaster.extractMemberChangedMessage(EMemberStatusChange.Disconnected);
    expect(disconnectMessage).toBeDefined();
    if (disconnectMessage) {
      expect(disconnectMessage.data.member.participantId === participant.participantId);
      expect(disconnectMessage.data.member.status === EParticipantStatus.Disconnected);
    }

    // test: observer should have received 1 MC disconnect
    expect(observer.messagesReceivedAfterInitial).toBe(1);
    expect(observer.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(1);
    disconnectMessage = observer.extractMemberChangedMessage(EMemberStatusChange.Disconnected);
    expect(disconnectMessage).toBeDefined();
    if (disconnectMessage) {
      expect(disconnectMessage.data.member.participantId === participant.participantId);
      expect(disconnectMessage.data.member.status === EParticipantStatus.Disconnected);
    }

    // test: participant should have received 1 MC join only
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);

    // test: unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('Scrum master disconnects', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // create team with two connected and one disconnected participant
    const scrumMaster= Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    const observer = Util.joinTeamNew( handlerService, Util.team1Name, Util.observer1Name, true);
    const disconnected = Util.joinTeamAndDisconnect(handlerService, Util.team1Name, Util.participant2Nick)

    // scrum master disconnects
    scrumMaster.closeSocket();

    // test: scrum master should have received 3 MC join + 1 MC Disconnect
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(4);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(3);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(1);

    // test: observer should have received 1 MC Join + 2 MC disconnect memberchange + 1 MC role change or 1 self
    expect(observer.messagesReceivedAfterInitial).toBe(4);
    expect(observer.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(observer.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(2);
    expect(
      observer.countMemberChangedMessages(EMemberStatusChange.ChangedRole) +
      observer.countMessageType(EServerMessageType.Self)
    ).toBe(1);

    let secondSelfMessage = observer.extractMessage<ISelfMessage>(EServerMessageType.Self);
    let otherMemberChangedRoleMessage = observer.extractMemberChangedMessage(EMemberStatusChange.ChangedRole);

    if (secondSelfMessage) {
      expect(otherMemberChangedRoleMessage).toBeUndefined();
      expect(secondSelfMessage.data.role).toBe(ERole.ScrumMaster);
      expect(secondSelfMessage.data.participantId).toBe(observer.participantId);
    }
    if (otherMemberChangedRoleMessage) {
      expect(secondSelfMessage).toBeUndefined();
      expect(otherMemberChangedRoleMessage.data.memberStatusChange).toBe(EMemberStatusChange.ChangedRole)
      expect(otherMemberChangedRoleMessage.data.member.participantId).toBe(participant.participantId);
      expect(otherMemberChangedRoleMessage.data.member.role).toBe(ERole.ScrumMaster);
    }

    // test: participant should have received 2 MC join + 2 MC disconnect + 1 MC role change or a second self
    expect(participant.messagesReceivedAfterInitial).toBe(5);
    expect(participant.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(2);
    expect(participant.countMemberChangedMessages(EMemberStatusChange.Disconnected)).toBe(2);
    expect(
      participant.countMemberChangedMessages(EMemberStatusChange.ChangedRole) +
      participant.countMessageType(EServerMessageType.Self)
    ).toBe(1);

    secondSelfMessage = participant.extractMessage<ISelfMessage>(EServerMessageType.Self);
    otherMemberChangedRoleMessage = participant.extractMemberChangedMessage(EMemberStatusChange.ChangedRole);

    if (secondSelfMessage) {
      expect(otherMemberChangedRoleMessage).toBeUndefined();
      expect(secondSelfMessage.data.role).toBe(ERole.ScrumMaster);
      expect(secondSelfMessage.data.participantId).toBe(participant.participantId);
    }
    if (otherMemberChangedRoleMessage) {
      expect(secondSelfMessage).toBeUndefined();
      expect(otherMemberChangedRoleMessage.data.memberStatusChange).toBe(EMemberStatusChange.ChangedRole)
      expect(otherMemberChangedRoleMessage.data.member.participantId).toBe(observer.participantId);
      expect(otherMemberChangedRoleMessage.data.member.role).toBe(ERole.ScrumMaster);
    }

    // test: disconnected should have received no messages
    expect(disconnected.messagesReceivedAfterInitial).toBe(0);

    // test: unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });

  test('A participant that is in no team disconnects', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // participant 2 connects and disconnects
    const participant = Util.connectParticipant(handlerService);
    participant.closeSocket();

    // test: unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});