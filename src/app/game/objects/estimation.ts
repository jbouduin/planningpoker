import * as Collections from 'typescript-collections';
import { DtoEstimation, DtoCard } from '@shared-lib';

import { Card } from './card';
import { Participant } from './participant';

export class Estimation {

  // <editor-fold desc='Private properties'>
  public readonly revealed: boolean;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public static createEstimation(
    dtoEstimation: DtoEstimation,
    participants: Collections.Dictionary<string, Participant>,
    cards: Array<Card>,
    self?: Participant): Estimation | undefined {

    let participant: Participant | undefined;
    if (self?.uuid === dtoEstimation.uuid) {
      participant = self;
    } else {
      participant = participants.getValue(dtoEstimation.uuid);
    }
    const selectedCard = cards.filter(card => card.index === dtoEstimation.card)[0];
    return participant && selectedCard ? new Estimation(participant, selectedCard, dtoEstimation.revealed) : undefined;
  }

  public constructor(public participant: Participant, public card: Card, revealed: boolean) {
    this.revealed = revealed;
  }
  // </editor-fold>
}
