import { jest, describe, expect, test } from '@jest/globals';

import { ECardSet, EErrorCode } from "../../../shared-lib/src";
import { ITeam, ServerParticipant } from "../../src/objects";
import { IWebSocket, ReadyState } from "../../src/services/websocket";
import { StorageService } from "../../src/storage/implementation";
import { IStorageService } from "../../src/storage/interfaces";

const socket: IWebSocket = {
  readyState: ReadyState.OPEN,
  close: jest.fn(undefined),
  send: jest.fn(undefined)
}

describe('Manage participants', () => {

  test('Create', () => {
    const storage: IStorageService = new StorageService();
    const participant = storage.createParticipant(socket);
    expect(participant).not.toBeNull();
    expect(participant).not.toBeUndefined();
    expect(participant.participantId.length).toBeGreaterThan(0);
    expect(storage.participantExists(participant.participantId)).toBe(true);
    expect(storage.filterParticipants((_p: ServerParticipant) => true).length).toBe(1);
    const participant2 = storage.createParticipant(socket);
    expect(participant2.participantId).not.toBe(participant.participantId);
    expect(storage.filterParticipants((_p: ServerParticipant) => true).length).toBe(2);
  });

  test('Delete', () => {
    const storage: IStorageService = new StorageService();
    const participant = storage.createParticipant(socket);
    storage.deleteParticipant(participant.participantId);
    expect(storage.filterParticipants((_p: ServerParticipant) => true).length).toBe(0);
    expect(storage.participantExists(participant.participantId)).toBe(false);
  });

  test('Get', () => {
    const storage: IStorageService = new StorageService();
    const participant = storage.createParticipant(socket);
    const getResult = storage.getParticipant(participant.participantId);
    expect(getResult).not.toBeUndefined();
    expect(getResult?.participantId).toBe(participant.participantId);
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

  test('canRejoin', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const participant = storage.createParticipant(socket);
    expect(storage.canRejoin(participant.participantId, 'team')).toBe(EErrorCode.TeamDoesNotExist);
    const team = storage.createTeam('team', cardSet);
    expect(storage.canRejoin(participant.participantId, team.teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storage.deleteParticipant(participant.participantId);
    expect(storage.canRejoin(participant.participantId, 'team')).toBe(EErrorCode.ParticipantNotFound);
  });

  test('join and delete team', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const participant = storage.createParticipant(socket);
    const team = storage.createTeam('team', cardSet);
    storage.joinTeam(team, participant);
    expect(storage.getTeamOfParticipant(participant.participantId)).not.toBeUndefined();
    expect(storage.getTeamOfParticipant(participant.participantId)?.teamName).toBe('team');
    expect(storage.getTeamNameOfParticipant(participant.participantId)).toBe('team');
    expect(team.allMembers.length).toBe(1);
    storage.deleteTeam('team');
    expect(team.allMembers.length).toBe(0);
    expect(storage.getTeam('team')).toBeUndefined();
    expect(storage.getTeamOfParticipant(participant.participantId)).toBeUndefined();
    expect(storage.getTeamNameOfParticipant(participant.participantId)).toBeUndefined();
  });

  test('join and delete participant', () => {
    const storage: IStorageService = new StorageService();
    const cardSet = { cardSet: ECardSet.Cohn, cards: [], unknownEstimationIndex: 0 };
    const participant = storage.createParticipant(socket);
    const team = storage.createTeam('team', cardSet);
    storage.joinTeam(team, participant);
    expect(storage.getTeamOfParticipant(participant.participantId)).not.toBeUndefined();
    expect(storage.getTeamOfParticipant(participant.participantId)?.teamName).toBe('team');
    expect(team.allMembers.length).toBe(1);
    storage.deleteParticipant(participant.participantId);
    expect(team.allMembers.length).toBe(0);
    expect(storage.getParticipant(participant.participantId)).toBeUndefined();
  });

});

describe('Serialization', () => {

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
    storage.createParticipant(socket);
    storage.createParticipant(socket);
    const participants = storage.serializeParticipants();
    expect(participants.length).toBe(2);
  });
});
