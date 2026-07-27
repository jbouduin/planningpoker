import { injectable } from 'inversify';
import { ServerEstimation } from '../../objects/implementation/index.js';
import type { IServerEstimation } from '../../objects/interfaces/server-estimation.js';
import type { IEstimationRepository } from '../../storage/interfaces/index.js';

@injectable()
export class EstimationRepository implements IEstimationRepository {
  //#region private properties ------------------------------------------------
  private readonly estimations: Map<string, Map<string, IServerEstimation>>;
  //#endregion

  //#region Construcotr & C° --------------------------------------------------
  public constructor() {
    this.estimations = new Map<string, Map<string, IServerEstimation>>();
  }
  //#endregion

  //#region EstimationDtoRepository methods -------------------------------------
  public clearEstimations(teamName: string): void {
    this.estimations.set(teamName, new Map<string, IServerEstimation>());
  }

  public deleteEstimation(teamName: string, participantId: string): void {
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.delete(participantId);
    }
  }

  public getEstimations(teamName: string): Array<IServerEstimation> {
    const teamEstimations = this.estimations.get(teamName);
    return teamEstimations ? Array.from(teamEstimations.values()) : new Array<IServerEstimation>();
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
    this.estimations.set(teamName, new Map<string, IServerEstimation>());
  }

  public upsertEstimation(teamName: string, participantId: string, cardIndex: number): IServerEstimation {
    const result = new ServerEstimation(participantId, cardIndex);
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.set(participantId, result);
    }
    return result;
  }
  //#endregion
}
