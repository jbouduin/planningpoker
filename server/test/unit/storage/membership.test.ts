import { describe, expect, test } from '@jest/globals';
import { Mock } from 'moq.ts';
import { IServerParticipant } from '../../../src/objects';
import { MembershipRepository } from '../../../src/storage/implementation';
import { IMembershipRepository, IServerParticipantRepository, ITeamRepository } from '../../../src/storage/interfaces';
import { Util } from '../util';

describe('Member scope', () => {
  test('join and leave', () => {
    const teamRepository = new Mock<ITeamRepository>();
    const participantRepository = new Mock<IServerParticipantRepository>();
    const repository: IMembershipRepository = new MembershipRepository(
      participantRepository.object(),
      teamRepository.object()
    );
    repository.joinTeam(Util.team1Name, Util.participant1Name);
    expect(repository.participantIsMemberOf(Util.participant1Name, Util.team1Name)).toBe(true);
    repository.leaveTeam(Util.team1Name, Util.participant1Name);
    expect(repository.participantIsMemberOf(Util.participant1Name, Util.team1Name)).toBe(false);
  });
});

describe('Team scope', () => {
  test('join and leave', () => {
    const teamRepository = new Mock<ITeamRepository>()
      .setup((r: ITeamRepository) => r.get(Util.team1Name))
      .returns(Util.getTeam1());
    const participantRepository = new Mock<IServerParticipantRepository>()
      .setup((r: IServerParticipantRepository) => r.get(Util.participant1Name))
      .returns(Util.getParticipant1());
    const repository: IMembershipRepository = new MembershipRepository(
      participantRepository.object(),
      teamRepository.object()
    );
    repository.joinTeam(Util.team1Name, Util.participant1Name);

    const retrievedTeam = repository.getTeamOfParticipant(Util.participant1Name);
    expect(retrievedTeam).toBeDefined();
    if (retrievedTeam) {
      expect(retrievedTeam.teamName).toBe(Util.team1Name);
    }
    const retrievedMemberList = repository.getTeamMembers(Util.team1Name);
    expect(retrievedMemberList.length).toBe(1);
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === Util.participant1Name)).toBeDefined();
    repository.leaveTeam(Util.team1Name, Util.participant1Name);
    expect(repository.getTeamOfParticipant(Util.participant1Name)).toBeUndefined();
    expect(repository.getTeamMembers(Util.team1Name).length).toBe(0);
  });

  test('query disconnected', () => {
    const teamRepository = new Mock<ITeamRepository>()
      .setup((r: ITeamRepository) => r.get(Util.team1Name))
      .returns(Util.getTeam1());
    const participantRepository = new Mock<IServerParticipantRepository>()
      .setup((r: IServerParticipantRepository) => r.get(Util.participant1Name))
      .returns(Util.getParticipant1())
      .setup((r: IServerParticipantRepository) => r.get(Util.disconnectedName))
      .returns(Util.getDisconnected());
    const repository: IMembershipRepository = new MembershipRepository(
      participantRepository.object(),
      teamRepository.object()
    );
    repository.joinTeam(Util.team1Name, Util.participant1Name);
    repository.joinTeam(Util.team1Name, Util.disconnectedName);
    let retrievedMemberList = repository.getTeamMembers(Util.team1Name);
    expect(retrievedMemberList.length).toBe(2);
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === Util.participant1Name)).toBeDefined();
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === Util.disconnectedName)).toBeDefined();
    retrievedMemberList = repository.getConnectedTeamMembers(Util.team1Name);
    expect(retrievedMemberList.length).toBe(1);
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === Util.participant1Name)).toBeDefined();
    expect(retrievedMemberList.find((p: IServerParticipant) => p.nick === Util.disconnectedName)).toBeUndefined();
  });

  test('remove team', () => {
    const teamRepository = new Mock<ITeamRepository>();
    const participantRepository = new Mock<IServerParticipantRepository>();
    const repository: IMembershipRepository = new MembershipRepository(
      participantRepository.object(),
      teamRepository.object()
    );
    repository.joinTeam(Util.team1Name, Util.participant1Name);
    repository.removeTeam(Util.team1Name);
    expect(repository.participantIsMemberOf(Util.participant1Name, Util.team1Name)).toBe(false);
    expect(repository.getTeamOfParticipant(Util.participant1Name)).toBeUndefined();
    expect(repository.getTeamMembers(Util.team1Name).length).toBe(0);
  });
});
