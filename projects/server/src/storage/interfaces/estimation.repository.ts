import { IEstimation } from "../../../../shared-lib/src";

export interface IEstimationRepository {
  createEstimation(uuid: string, card: number, revealed: boolean): IEstimation;
  deleteEstimation(teamName: string, participantUuid: string): IEstimation;
  getEstimations(teamName: string): Array<IEstimation>;
  removeTeam(teamName: string): void;
  removeParticipant(teamName: string, uuid: string): void;
  startEstimating(teamName: string): void;
  upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): IEstimation;
}