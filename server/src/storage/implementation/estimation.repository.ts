import { injectable } from 'inversify';
import { IEstimation } from 'shared-lib';

import { Estimation } from '../../objects';
import { IEstimationRepository } from '../../storage/interfaces';

@injectable()
export class EstimationRepository implements IEstimationRepository {
  //#region private properties ------------------------------------------------
  private readonly estimations: Map<string, Map<string, IEstimation>>;
  //#endregion

  //#region Construcotr & C° --------------------------------------------------
  public constructor() {
    this.estimations = new Map<string, Map<string, IEstimation>>();
  }
  //#endregion

  //#region IEstimationRepository methods -------------------------------------
  public deleteEstimation(teamName: string, participantId: string): IEstimation {
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.delete(participantId);
    }
    return new Estimation(participantId, undefined);
  }

  public getEstimations(teamName: string): Array<IEstimation> {
    const teamEstimations = this.estimations.get(teamName);
    return teamEstimations ? Array.from(teamEstimations.values()) : new Array<IEstimation>();
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
    this.estimations.set(teamName, new Map<string, IEstimation>());
  }

  public upsertEstimation(teamName: string, participantId: string, cardIndex: number): IEstimation {
    const result = new Estimation(participantId, cardIndex);
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.set(participantId, result);
    }
    return result;
  }
  //#endregion
}
