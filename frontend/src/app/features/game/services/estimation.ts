import { ICard } from 'shared-lib';
import { Member } from '../../../core';

export class Estimation {
  //#region Public properties -------------------------------------------------
  public readonly card: ICard | null;
  public readonly member: Member;
  public readonly revealed: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(member: Member, card: ICard | null, revealed: boolean) {
    this.member = member;
    this.card = card;
    this.revealed = revealed;
  }
  //#endregion
}
