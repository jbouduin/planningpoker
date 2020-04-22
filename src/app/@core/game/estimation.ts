import * as Collections from 'typescript-collections';
import { DtoEstimation, DtoCard } from '../../../../projects/shared-lib/lib';

import { Card } from './card';
import { Participant } from './participant';

export class Estimation {

  // <editor-fold desc='Private properties'>
  public readonly revealed: boolean;
  // </editor-fold>

  // <editor-fold desc='Public get methods'>
  public get mine(): boolean {
    return this.participant.me;
  }

  public get nick(): string {
    return this.participant.nick;
  }

  public get label(): string {
    return this.card.label;
  }
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

  public constructor(private participant: Participant, private card: Card, revealed: boolean) {
    this.revealed = revealed;
  }
  // </editor-fold>
}
