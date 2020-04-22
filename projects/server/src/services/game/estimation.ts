import { DtoEstimation } from '../../../../shared-lib/lib';

export class Estimation implements DtoEstimation {

  // <editor-fold desc='public readonly properties'>
  public readonly revealed = true;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(public readonly uuid: string, public readonly card: number) {}
  // </editor-fold>
}
