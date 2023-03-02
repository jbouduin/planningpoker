import { describe, expect, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { ECardSet, EErrorCode, EParticipantStatus } from "../../../../shared-lib/src";
import { ICardService } from '../../../src/services/interfaces';
import { IStorageService } from "../../../src/storage/interfaces";
import { Util } from './util';

describe('Join/Leave', () => {
  test('Join', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant 1
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 1 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // create participant 2
    const participant2Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 2 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant2Id);
    // retrieve
    const teamMembers = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeamMembers(Util.team1Name);
    // test
    expect(teamMembers).toHaveLength(2);
    expect(teamMembers[0].participantId).not.toBe(teamMembers[1].participantId);
  });

  test('Leave', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 1 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // create participant 2
    const participant2Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 2 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant2Id);
    // participant 1 leaves
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .leaveTeam(Util.team1Name, participant1Id);
    // retrieve
    const teamMembers = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeamMembers(Util.team1Name);
    // test
    expect(teamMembers).toHaveLength(1);
    expect(teamMembers[0].participantId).toBe(participant2Id);
  });
});

describe('Can rejoin', () => {
  test('Can', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant 1
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 1 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin(participant1Id, Util.team1Name))
      .toBe(EErrorCode.NoError);
  });

  test('Can not: team does not exist', () => {
    const container = Util.getContainer();
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin(participant1Id, Util.team1Name))
      .toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Can not: participant does not exist', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin('', Util.team1Name))
      .toBe(EErrorCode.ParticipantNotFound);
  });

  test('Can not: participant not in team', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin(participant1Id, Util.team1Name))
      .toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Can not: participant in other team', () => {
    const container = Util.getContainer();
    const cardSet1 = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    const cardSet2 = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    // create team 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet1);
    // create team 2
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team2Name, cardSet2);
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant joins team 1
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).canRejoin(participant1Id, Util.team2Name))
      .toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe('Queries', () => {
  // TODO 2367 if all members disconnected, first one who joins again becomes scrum master
  test('Get first connected team member: defined', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant 1
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 1 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // create participant 2
    const participant2Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 2 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant2Id);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getFirstConnectedTeamMember(Util.team1Name))
      .toBeDefined();
  });

  test('Get first connected Team member: undefined', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant 1 as disconnected
    const participant1 = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket());
    participant1.status = EParticipantStatus.Disconnected;
    const participant1Id = participant1.participantId;
    // participant 1 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // create participant 2 as disconnected
    const participant2 = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket());
    participant2.status = EParticipantStatus.Disconnected;
    const participant2Id = participant1.participantId;
    // participant 2 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant2Id);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getFirstConnectedTeamMember(Util.team1Name))
      .toBeUndefined();
  });

  test('Get connected Team members', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant 1
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 1 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // create participant 2
    const participant2Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant 2 joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant2Id);
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getConnectedTeamMembers(Util.team1Name).length)
      .toBe(2);
  });

  test('Get Team of participant', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant 1
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // participant joins
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .joinTeam(Util.team1Name, participant1Id);
    // retrieve
    const retrieved = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .getTeamOfParticipant(participant1Id);
    // test
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.teamName).toBe(Util.team1Name);
    }
  });

  test('Get Team of participant undefined', () => {
    const container = Util.getContainer();
    const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Fibonacci);
    // create team
    container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createTeam(Util.team1Name, cardSet);
    // create participant
    const participant1Id = container
      .get<IStorageService>(STORAGETYPES.StorageService)
      .createParticipant(Util.getSocket()).participantId;
    // test
    expect(container.get<IStorageService>(STORAGETYPES.StorageService).getTeamOfParticipant(participant1Id))
      .toBeUndefined();
  });
});