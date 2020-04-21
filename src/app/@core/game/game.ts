import { DtoCard, DtoGame } from '../../../../projects/shared-lib/lib';

export class Game implements DtoGame {

  // public properties
  public team: string;
  public cards: Array<DtoCard>;

  // constructor
  public constructor(team: string, cards: Array<DtoCard>) {
    this.team = team;
    this.cards = cards;
  }
}
