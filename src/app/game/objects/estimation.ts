import { DtoEstimation } from '@shared-lib';
import { Card } from './card';
import { Participant } from './participant';

export class Estimation {

  //#region Public properties -------------------------------------------------
  public readonly card: Card
  public readonly participant: Participant;
  public readonly revealed: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public static createEstimation(
    dtoEstimation: DtoEstimation,
    participants: Map<string, Participant>,
    cards: Array<Card>,
    self?: Participant): Estimation | undefined {

    let participant: Participant | undefined;
    if (self?.uuid === dtoEstimation.uuid) {
      participant = self;
    } else {
      participant = participants.get(dtoEstimation.uuid);
    }
    const selectedCard = cards.filter(card => card.index === dtoEstimation.card)[0];
    return participant && selectedCard ? new Estimation(participant, selectedCard, dtoEstimation.revealed) : undefined;
  }

  public constructor(participant: Participant, card: Card, revealed: boolean) {
    this.participant = participant;
    this.card = card;
    this.revealed = revealed;
  }
  //#endregion
}
