import { IEstimation } from '../../../shared-lib/src';

export class Estimation implements IEstimation {

  //#region public properties ----------------------------------------
  public revealed: boolean;
  public participantUuid: string;
  public cardIndex: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(uuid: string, card: number, revealed = true) {
    this.revealed = revealed;
    this.participantUuid = uuid;
    this.cardIndex = card;
  }
  //#endregion
}
