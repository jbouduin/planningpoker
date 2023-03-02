import { IEstimation } from '../../../../shared-lib/src';

export class Estimation implements IEstimation {

  //#region public properties ----------------------------------------
  public revealed: boolean;
  public participantId: string;
  public cardIndex: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(participantId: string, cardIndex: number, revealed = true) {
    this.participantId = participantId;
    this.cardIndex = cardIndex;
    this.revealed = revealed;
  }
  //#endregion
}
