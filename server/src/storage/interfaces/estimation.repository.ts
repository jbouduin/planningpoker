import { EstimationDto } from 'shared-lib';

export interface IEstimationRepository {
  deleteEstimation(teamName: string, participantId: string): EstimationDto;
  getEstimations(teamName: string): Array<EstimationDto>;
  removeTeam(teamName: string): void;
  removeParticipant(teamName: string, participantId: string): void;
  startEstimating(teamName: string): void;
  upsertEstimation(teamName: string, participantId: string, cardIndex: number | undefined): EstimationDto;
}
