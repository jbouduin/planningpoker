import { injectable } from "inversify";
import { IEstimation } from "../../../../shared-lib/src";

import { Estimation } from "../../objects";
import { IEstimationRepository } from "../../storage/interfaces";

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
  public createEstimation(uuid: string, card: number, revealed: boolean): IEstimation {
    return new Estimation(uuid, card, revealed);
  }

  public deleteEstimation(teamName: string, participantUuid: string): IEstimation {
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.delete(participantUuid);
    }
    return new Estimation(participantUuid, -1);
  }

  public getEstimations(teamName: string): Array<IEstimation> {
    const teamEstimations = this.estimations.get(teamName);
    return teamEstimations ? Array.from(teamEstimations.values()) : new Array<IEstimation>();
  }

  public removeTeam(teamName: string): void {
    this.estimations.delete(teamName);
  }

  public removeParticipant(teamName: string, uuid: string): void {
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.delete(uuid);
    }
  }

  public startEstimating(teamName: string): void {
    this.estimations.set(teamName, new Map<string, IEstimation>());
  }

  public upsertEstimation(teamName: string, participantUuid: string, cardIndex: number): IEstimation {
    const result = new Estimation(participantUuid, cardIndex);
    const teamEstimations = this.estimations.get(teamName);
    if (teamEstimations) {
      teamEstimations.set(participantUuid, result);
    }
    return result;
  }
  //#endregion
}