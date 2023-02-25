import { Estimation } from "../../objects";

export interface IEstimationRepository {
  deleteEstimation(teamName: string, participantUuid: string): Estimation;
  removeTeam(teamName: string): void;
  getEstimations(teamName: string): Array<Estimation>;
  reveal(teamName: string, unknownEstimationIndex: number): Array<Estimation>;
  startEstimating(teamName: string): void;
  upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): Estimation;
}