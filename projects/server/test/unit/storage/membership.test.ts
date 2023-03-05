import { jest, expect, test, describe } from '@jest/globals';
import { Mock } from 'moq.ts';

import { IWebSocket, ReadyState } from '../../../src/services/websocket';
import { EParticipantStatus, EPokerStatus, ERole } from '../../../../shared-lib/src';
import { ITeam } from '../../../src/objects/interfaces/team';
import { MembershipRepository } from '../../../src/storage/implementation/membership.repository';
import { IMembershipRepository } from '../../../src/storage/interfaces/membership.repository';
import { IServerParticipantRepository } from '../../../src/storage/interfaces/server-participant.repository';
import { ITeamRepository } from '../../../src/storage/interfaces/team.repository';
import { IServerParticipant, ServerParticipant } from '../../../src/objects';

// TODO NOW use util
const socket: IWebSocket = {
  readyState: ReadyState.OPEN,
  close: jest.fn(undefined),
  send: jest.fn(undefined)
};

const team1Name = 'team';
const team1: ITeam = {
  teamName: team1Name,
  lastAccessTime: Date.now(),
  status: EPokerStatus.Cleared
}
const participant1Name = 'participant';
const participant1 = new ServerParticipant(
  {
    nick: participant1Name,
    participantId: participant1Name,
    role: ERole.Developer,
    status: EParticipantStatus.Connected,
    observer: true
  }, socket);

const disconnectedName = 'disconnectName';
const disconnected = new ServerParticipant(
  {
    nick: disconnectedName,
    participantId: disconnectedName,
    role: ERole.Developer,
    status: EParticipantStatus.Disconnected,
    observer: true
  }, socket);

describe('Member scope', () => {
  test('join and leave', () => {
    const teamRepository = new Mock<ITeamRepository>();
    const participantRepository = new Mock<IServerParticipantRepository>();
    const repository: IMembershipRepository = new MembershipRepository(participantRepository.object(), teamRepository.object());
    repository.joinTeam(team1Name, participant1Name);
    expect(repository.participantIsMemberOf(participant1Name, team1Name)).toBe(true);
    repository.leaveTeam(team1Name, participant1Name);
    expect(repository.participantIsMemberOf(participant1Name, team1Name)).toBe(false);
  });
});

describe('Team scope', () => {
  test('join and leave', () => {
    const teamRepository = new Mock<ITeamRepository>()
      .setup((r: ITeamRepository) => r.get(team1Name))
      .returns(team1);
    const participantRepository = new Mock<IServerParticipantRepository>()
      .setup((r: IServerParticipantRepository) => r.get(participant1Name))
      .returns(participant1);
    const repository: IMembershipRepository = new MembershipRepository(participantRepository.object(), teamRepository.object());
    repository.joinTeam(team1Name, participant1Name);

    const retrievedTeam = repository.getTeamOfParticipant(participant1Name);
    expect(retrievedTeam).toBeDefined();
    if (retrievedTeam) {
      expect(retrievedTeam.teamName).toBe(team1Name);
    }
    const retrievedMemberList = repository.getTeamMembers(team1Name);
    expect(retrievedMemberList.length).toBe(1);
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === participant1Name)).toBeDefined();
    repository.leaveTeam(team1Name, participant1Name);
    expect(repository.getTeamOfParticipant(participant1Name)).toBeUndefined();
    expect(repository.getTeamMembers(team1Name).length).toBe(0);
  });

  test('query disconnected', () => {
    const teamRepository = new Mock<ITeamRepository>()
      .setup((r: ITeamRepository) => r.get(team1Name))
      .returns(team1)
      .setup((r: ITeamRepository) => r.get(team1Name))
      .returns(team1);
    const participantRepository = new Mock<IServerParticipantRepository>()
      .setup((r: IServerParticipantRepository) => r.get(participant1Name))
      .returns(participant1)
      .setup((r: IServerParticipantRepository) => r.get(disconnectedName))
      .returns(disconnected);
    const repository: IMembershipRepository = new MembershipRepository(participantRepository.object(), teamRepository.object());
    repository.joinTeam(team1Name, participant1Name);
    repository.joinTeam(team1Name, disconnectedName);
    let retrievedMemberList = repository.getTeamMembers(team1Name);
    expect(retrievedMemberList.length).toBe(2);
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === participant1Name)).toBeDefined();
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === disconnectedName)).toBeDefined();
    retrievedMemberList = repository.getConnectedTeamMembers(team1Name);
    expect(retrievedMemberList.length).toBe(1);
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === participant1Name)).toBeDefined();
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === disconnectedName)).toBeUndefined();

  });

  test('remove team', () => {
    const teamRepository = new Mock<ITeamRepository>();
    const participantRepository = new Mock<IServerParticipantRepository>();
    const repository: IMembershipRepository = new MembershipRepository(participantRepository.object(), teamRepository.object());
    repository.joinTeam(team1Name, participant1Name);
    repository.removeTeam(team1Name);
    expect(repository.participantIsMemberOf(participant1Name, team1Name)).toBe(false);
    expect(repository.getTeamOfParticipant(participant1Name)).toBeUndefined();
    expect(repository.getTeamMembers(team1Name).length).toBe(0);
  })
});