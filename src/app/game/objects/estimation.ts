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
  public static createEstimation(
    dtoEstimation: IEstimation,
    members: Map<string, Member>,
    cards: Array<Card>,
    self?: Member): Estimation | undefined {

    let member: Member | undefined;
    if (self?.uuid === dtoEstimation.uuid) {
      member = self;
    } else {
      member = members.get(dtoEstimation.uuid);
    }
    const selectedCard = cards.filter(card => card.index === dtoEstimation.card)[0];
    return member && selectedCard ? new Estimation(member, selectedCard, dtoEstimation.revealed) : undefined;
  }

  public constructor(member: Member, card: Card, revealed: boolean) {
    this.member = member;
    this.card = card;
    this.revealed = revealed;
  }
  //#endregion
}
