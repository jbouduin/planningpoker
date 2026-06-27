import { EstimationDto } from 'shared-lib';

export class Estimation implements EstimationDto {
  //#region IEstimation properties --------------------------------------------
  // TODO → we do not want other participants to intercept messages to check the estimations
  // If the game does not have status revealed, currenlty we would to send a card tho show in
  // the app that the participant has given an estimation.
  // Solution: add a property indicating that, although card is null, the participant has
  // estimated. This would also mean that, when sending gameStatusChanged(revealed) we have to
  // resend the estimation list with values
  public participantId: string;
  public cardIndex: number | null;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(participantId: string, cardIndex: number | null) {
    this.participantId = participantId;
    this.cardIndex = cardIndex;
    // this.revealed = revealed;
  }
  //#endregion
}
