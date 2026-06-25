import { EstimationDto } from 'shared-lib';

export class Estimation implements EstimationDto {
  //#region IEstimation properties --------------------------------------------
  // TODO public revealed: boolean; → we do not want other participants to intercept messages to check the estimations
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
