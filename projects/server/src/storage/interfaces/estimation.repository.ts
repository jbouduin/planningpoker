import { Estimation } from "../../objects";

export interface IEstimationRepository {
  deleteEstimation(teamName: string, participantUuid: string): Estimation;
  getEstimations(teamName: string): Array<Estimation>;
  removeTeam(teamName: string): void;
  removeParticipant(teamName: string, uuid: string): void;
  startEstimating(teamName: string): void;
  upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): Estimation;
}