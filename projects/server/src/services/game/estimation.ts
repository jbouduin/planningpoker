import { DtoEstimation } from '../../../../shared-lib/lib';

export class Estimation implements DtoEstimation {

  //#region  public readonly properties
  public readonly revealed = true;
  //#endregion

  //#region  Constructor & C°
  public constructor(public readonly uuid: string, public readonly card: number) {}
  //#endregion
}
