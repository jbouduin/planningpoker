import { Participant } from "../../objects";

export interface IMembershipRepository  {
  removeTeam(teamName: string): Array<Participant>;
  getConnectedTeamMembers(teamName: string): Array<Participant>;
  getTeamMembers(teamName: string): Array<Participant>;
  joinTeam(teamName: string, participant: string): void;
  leaveTeam(teamName: string, participant: string): void;
}