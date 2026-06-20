import { IEstimation } from 'shared-lib';

export class Estimation implements IEstimation {
  //#region IEstimation properties --------------------------------------------
  // public revealed: boolean;
  public participantId: string;
  public cardIndex: number | undefined;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(participantId: string, cardIndex: number | undefined) {
    this.participantId = participantId;
    this.cardIndex = cardIndex;
    // this.revealed = revealed;
  }
  //#endregion
}
