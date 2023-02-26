import { IEstimation } from "../../../../shared-lib/src";

export interface IEstimationRepository {
  createEstimation(participantId: string, card: number, revealed: boolean): IEstimation;
  deleteEstimation(teamName: string, participantId: string): IEstimation;
  getEstimations(teamName: string): Array<IEstimation>;
  removeTeam(teamName: string): void;
  removeParticipant(teamName: string, participantId: string): void;
  startEstimating(teamName: string): void;
  upsertEstimation(teamName: string, participantId: string, cardIndex: number): IEstimation;
}