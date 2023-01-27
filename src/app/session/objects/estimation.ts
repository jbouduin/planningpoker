import { IEstimation } from '@shared-lib';
import { Card } from './card';
import { Member } from './member';

export class Estimation {

  //#region Public properties -------------------------------------------------
  public readonly card: Card
  public readonly member: Member;
  public readonly revealed: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(member: Member, card: Card, revealed: boolean) {
    this.member = member;
    this.card = card;
    this.revealed = revealed;
  }
  //#endregion
}
