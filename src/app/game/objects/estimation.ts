import { IEstimation } from '@shared-lib';
import { Card } from './card';
import { Member } from './member';

export class Estimation {

  //#region Public properties -------------------------------------------------
  public readonly card: Card
  public readonly participant: Member;
  public readonly revealed: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public static createEstimation(
    dtoEstimation: IEstimation,
    participants: Map<string, Member>,
    cards: Array<Card>,
    self?: Member): Estimation | undefined {

    let participant: Member | undefined;
    if (self?.uuid === dtoEstimation.uuid) {
      participant = self;
    } else {
      participant = participants.get(dtoEstimation.uuid);
    }
    const selectedCard = cards.filter(card => card.index === dtoEstimation.card)[0];
    return participant && selectedCard ? new Estimation(participant, selectedCard, dtoEstimation.revealed) : undefined;
  }

  public constructor(participant: Member, card: Card, revealed: boolean) {
    this.participant = participant;
    this.card = card;
    this.revealed = revealed;
  }
  //#endregion
}
