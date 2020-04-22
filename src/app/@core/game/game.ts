import * as Collections from 'typescript-collections';

import { DtoCard, DtoEstimation, DtoGame, GameStatus } from '../../../../projects/shared-lib/lib';

import { Card } from './card';
import { Estimation } from './estimation';
import { Participant } from './participant';

export class Game {

  // <editor-fold desc='Private properties'>
  private estimationCollection: Collections.Dictionary<string, Estimation>;
  private readonly cardCollection: Collections.Dictionary<number, Card>;
  // </editor-fold>

  // <editor-fold desc='Public getter methods '>
  public get availableCards(): Array<Card> {
    return this.cardCollection.values();
  }

  public get estimations(): Array<Estimation> {
    return this.estimationCollection.values();
  }

  public get status(): GameStatus {
    return this.gameStatus;
  }

  public get team(): string {
    return this.name;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public static createGame(team: string, status: GameStatus): Game {
    return new Game(team, status);
  }

  private constructor(private name: string, private gameStatus: GameStatus) {
    this.cardCollection = new Collections.Dictionary<number, Card>();
    this.estimationCollection = new Collections.Dictionary<string, Estimation>();
  }
  // </editor-fold>//

  // <editor-fold desc='Public methods'>
  public clearEstimations(): void {
    this.estimationCollection.clear();
  }

  public handleEstimations(
    dtoEstimations: Array<DtoEstimation>,
    participants: Collections.Dictionary<string, Participant>,
    self?: Participant): void {
    dtoEstimations.forEach(dtoEstimation => {
      if (dtoEstimation.card >= 0) {
        const estimation = Estimation.createEstimation(dtoEstimation, participants, this.cardCollection.values(), self);
        if (estimation) {
          this.estimationCollection.setValue(dtoEstimation.uuid, estimation);
        }
      } else {
        this.estimationCollection.remove(dtoEstimation.uuid);
      }
    });
  }

  public reset(): void {
    this.cardCollection.clear();
    this.estimationCollection.clear();
    this.gameStatus = GameStatus.NoGame;
    this.name = '';
  }

  public setCards(cards: Array<DtoCard>) {
    cards
      .map(card => Card.createCard(card))
     .forEach(card => this.cardCollection.setValue(card.index, card));
  }

  public update(dtoGame: DtoGame) {
    this.gameStatus = dtoGame.status;
    this.name = dtoGame.team;
  }
  // </editor-fold>
}
