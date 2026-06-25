import { injectable } from 'inversify';
import { EstimationDto } from 'shared-lib';
import { Estimation } from '../../objects/implementation/index.js';
import type { IEstimationRepository } from '../../storage/interfaces/index.js';

@injectable()
export class EstimationRepository implements IEstimationRepository {
  //#region private properties ------------------------------------------------
  private readonly estimations: Map<string, Map<string, EstimationDto>>;
  //#endregion

  //#region Construcotr & C° --------------------------------------------------
  public constructor() {
    this.estimations = new Map<string, Map<string, EstimationDto>>();
  }
  //#endregion

  //#region EstimationDtoRepository methods -------------------------------------
  public deleteEstimation(teamName: string, participantId: string): EstimationDto {
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.delete(participantId);
    }
    return new Estimation(participantId, undefined);
  }

  public getEstimations(teamName: string): Array<EstimationDto> {
    const teamEstimations = this.estimations.get(teamName);
    return teamEstimations ? Array.from(teamEstimations.values()) : new Array<EstimationDto>();
  }

  public removeTeam(teamName: string): void {
    this.estimations.delete(teamName);
  }

  public removeParticipant(teamName: string, participantId: string): void {
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.delete(participantId);
    }
  }

  public startEstimating(teamName: string): void {
    this.estimations.set(teamName, new Map<string, EstimationDto>());
  }

  public upsertEstimation(teamName: string, participantId: string, cardIndex: number): EstimationDto {
    const result = new Estimation(participantId, cardIndex);
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.set(participantId, result);
    }
    return result;
  }
  //#endregion
}
