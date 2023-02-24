import { IEstimation } from '../../../shared-lib/src';

export class Estimation implements IEstimation {

  //#region public readonly properties ----------------------------------------
  public readonly revealed = true;
  public readonly participantUuid: string;
  public readonly card: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(uuid: string, card: number) {
    this.participantUuid = uuid;
    this.card = card;
  }
  //#endregion
}
