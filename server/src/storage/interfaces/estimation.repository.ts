import type { IServerEstimation } from '../../objects/interfaces/index.js';

export interface IEstimationRepository {
  clearEstimations(teamName: string): void;
  deleteEstimation(teamName: string, participantId: string): void;
  getEstimations(teamName: string): Array<IServerEstimation>;
  removeTeam(teamName: string): void;
  removeParticipant(teamName: string, participantId: string): void;
  startEstimating(teamName: string): void;
  upsertEstimation(teamName: string, participantId: string, cardIndex: number | undefined): IServerEstimation;
}
