import { ITeam, IServerParticipant } from '../../objects';

export interface IMembershipRepository {
  removeTeam(teamName: string): void;
  getConnectedTeamMembers(teamName: string): Array<IServerParticipant>;
  getTeamMembers(teamName: string): Array<IServerParticipant>;
  getTeamOfParticipant(participantId: string): ITeam | undefined;
  participantIsMemberOf(participantId: string, teamName: string): boolean;
  joinTeam(teamName: string, participant: string): void;
  leaveTeam(teamName: string, participant: string): void;
}
