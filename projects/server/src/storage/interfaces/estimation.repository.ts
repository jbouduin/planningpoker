import { IEstimation } from "../../../../shared-lib/src";

export interface IEstimationRepository {
  deleteEstimation(teamName: string, participantId: string): IEstimation;
  getEstimations(teamName: string): Array<IEstimation>;
  removeTeam(teamName: string): void;
  removeParticipant(teamName: string, participantId: string): void;
  startEstimating(teamName: string): void;
  upsertEstimation(teamName: string, participantId: string, cardIndex: number | undefined): IEstimation;
}