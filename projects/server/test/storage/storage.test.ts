import { jest, describe, expect, test } from '@jest/globals';

import { ECardSet, EErrorCode } from "../../../shared-lib/lib";
import { ITeam, Participant } from "../../src/objects";
import { IWebSocket, ReadyState } from "../../src/services/websocket";
import { StorageService } from "../../src/storage/implementation";
import { IStorageService } from "../../src/storage/interfaces";

describe('Manage participants', () => {
  const socket: IWebSocket = {
    readyState: ReadyState.OPEN,
    close: jest.fn().mockImplementation(() => { }),
    send: jest.fn().mockImplementation(() => { })
  }

  test('Create', () => {
    const storage: IStorageService = new StorageService();
    const participant = storage.createParticipant(socket);
    expect(participant).not.toBeNull();
    expect(participant).not.toBeUndefined();
    expect(participant.uuid.length).toBeGreaterThan(0);
    expect(storage.participantExists(participant.uuid)).toBe(true);
    expect(storage.filterParticipants((_p: Participant) => true).length).toBe(1);
    const participant2 = storage.createParticipant(socket);
    expect(participant2.uuid).not.toBe(participant.uuid);
    expect(storage.filterParticipants((_p: Participant) => true).length).toBe(2);
  });

  test('Delete', () => {
    const storage: IStorageService = new StorageService();
    const participant = storage.createParticipant(socket);
    storage.deleteParticipant(participant.uuid);
    expect(storage.filterParticipants((_p: Participant) => true).length).toBe(0);
    expect(storage.participantExists(participant.uuid)).toBe(false);
  });

  test('Get', () => {
    const storage: IStorageService = new StorageService();
    const participant = storage.createParticipant(socket);
    const getResult = storage.getParticipant(participant.uuid);
    expect(getResult).not.toBeUndefined();
    expect(getResult?.uuid).toBe(participant.uuid);
  });
});

describe('Manage Teams', () => {
  test('Create', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const team = storage.createTeam('team', cardSet);
    expect(team).not.toBeNull();
    expect(team).not.toBeUndefined();
    expect(team.teamName).toBe('team');
    expect(storage.teamExists('team')).toBe(true);
    expect(storage.filterTeams((_t: ITeam) => true).length).toBe(1);
    storage.createTeam('team2', cardSet);
    expect(storage.filterTeams((_t: ITeam) => true).length).toBe(2);
  });

  test('Delete', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const team = storage.createTeam('team', cardSet);
    storage.deleteTeam(team.teamName);
    expect(storage.filterTeams((_t: ITeam) => true).length).toBe(0);
    expect(storage.teamExists('team')).toBe(false);
  });

  test('Get', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    storage.createTeam('team', cardSet);
    const getResult = storage.getTeam('team');
    expect(getResult).not.toBeUndefined();
    expect(getResult?.teamName).toBe('team');
  });
});

describe('Team membership', () => {
  const socket: IWebSocket = {
    readyState: ReadyState.OPEN,
    close: jest.fn().mockImplementation(() => { }),
    send: jest.fn().mockImplementation(() => { })
  }

  test('canRejoin', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const participant = storage.createParticipant(socket);
    expect(storage.canRejoin(participant.uuid, 'team')).toBe(EErrorCode.TeamDoesNotExist);
    const team = storage.createTeam('team', cardSet);
    expect(storage.canRejoin(participant.uuid, team.teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storage.deleteParticipant(participant.uuid);
    expect(storage.canRejoin(participant.uuid, 'team')).toBe(EErrorCode.ParticipantNotFound);
  });

  test('join and delete team', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const participant = storage.createParticipant(socket);
    const team = storage.createTeam('team', cardSet);
    storage.joinTeam(team, participant);
    expect(storage.getTeamOfParticipant(participant.uuid)).not.toBeUndefined();
    expect(storage.getTeamOfParticipant(participant.uuid)?.teamName).toBe('team');
    expect(storage.getTeamNameOfParticipant(participant.uuid)).toBe('team');
    expect(team.allMembers.length).toBe(1);
    storage.deleteTeam('team');
    expect(team.allMembers.length).toBe(0);
    expect(storage.getTeam('team')).toBeUndefined();
    expect(storage.getTeamOfParticipant(participant.uuid)).toBeUndefined();
    expect(storage.getTeamNameOfParticipant(participant.uuid)).toBeUndefined();
  });

  test('join and delete participant', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const participant = storage.createParticipant(socket);
    const team = storage.createTeam('team', cardSet);
    storage.joinTeam(team, participant);
    expect(storage.getTeamOfParticipant(participant.uuid)).not.toBeUndefined();
    expect(storage.getTeamOfParticipant(participant.uuid)?.teamName).toBe('team');
    expect(team.allMembers.length).toBe(1);
    storage.deleteParticipant(participant.uuid);
    expect(team.allMembers.length).toBe(0);
    expect(storage.getParticipant(participant.uuid)).toBeUndefined();
  });

});

describe('Serialization', () => {
  const socket: IWebSocket = {
    readyState: ReadyState.OPEN,
    close: jest.fn().mockImplementation(() => { }),
    send: jest.fn().mockImplementation(() => { })
  }

  test('Team Serialization', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const participant = storage.createParticipant(socket);
    const team = storage.createTeam('team', cardSet);
    storage.joinTeam(team, participant);
    const teams = storage.serializeAllTeams();
    expect(teams['teams'].length).toBeGreaterThan(0);
    let team1 = storage.serializeTeam('team');
    expect(team1['team']).toBe('team');
    expect(team1['members'].length).toBeGreaterThan(0);
    team1 = storage.serializeTeam('other');
    expect(team1['error']).toBe(EErrorCode.TeamDoesNotExist);
  });

  test('Participant serialization', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    storage.createParticipant(socket);
    storage.createParticipant(socket);
    const participants = storage.serializeParticipants();
    expect(participants.length).toBe(2);
  });
});
