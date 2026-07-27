import { IServerEstimation } from '../interfaces/index.js';

export class ServerEstimation implements IServerEstimation {
  //#region Public RO fields --------------------------------------------------
  public readonly cardIndex: number;
  public readonly participantId: string;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(participantId: string, cardIndex: number) {
    this.cardIndex = cardIndex;
    this.participantId = participantId;
  }
  //#endregion
}
