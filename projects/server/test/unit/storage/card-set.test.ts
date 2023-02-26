import { describe, expect, test } from '@jest/globals';

import { ECardSet, ICard, ICardSet } from '../../../../shared-lib/src';
import { CardSetRepository } from '../../../src/storage/implementation/card-set.repository';
import { ICardSetRepository } from '../../../src/storage/interfaces/card-set.repository';

const cardSet1: ICardSet = {
  cardSet: ECardSet.Cohn,
  cards: new Array<ICard>(),
  unknownEstimationIndex: 1
};

const cardSet2: ICardSet = {
  cardSet: ECardSet.Fibonacci,
  cards: new Array<ICard>(),
  unknownEstimationIndex: 2
};

const cardSet3: ICardSet = {
  cardSet: ECardSet.TShirt,
  cards: new Array<ICard>(),
  unknownEstimationIndex: 3
};

const team1Name = 'team1';
const team2Name = 'team2';

describe('CRUD', () => {

  test('Create', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    repository.setCardSet(team1Name, cardSet1);
    const retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.unknownEstimationIndex).toBe(cardSet1.unknownEstimationIndex);
      expect(retrieved.cardSet).toBe(cardSet1.cardSet);
      expect(retrieved.cards.length).toBe(cardSet1.cards.length);
    }
  });

  test('Update', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    repository.setCardSet(team1Name, cardSet1);

    repository.setCardSet(team1Name, cardSet2);
    const retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.unknownEstimationIndex).toBe(cardSet2.unknownEstimationIndex);
      expect(retrieved.cardSet).toBe(cardSet2.cardSet);
      expect(retrieved.cards.length).toBe(cardSet2.cards.length);
    }
  });

  test('Retrieve unexisting', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    expect(repository.getCardSet(team1Name)).toBeUndefined();
  });


  test('Delete non existing returns false', () => {
    const teamName = 'team';
    const repository: ICardSetRepository = new CardSetRepository();
    expect(repository.removeCardSet(teamName)).toBe(false);
  });

  test('Delete', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    repository.setCardSet(team1Name, cardSet1);

    expect(repository.removeCardSet(team1Name)).toBe(true);
    const retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeUndefined();

  });

});

describe('Two teams', () => {
  test('create cardset for two teams', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    repository.setCardSet(team1Name, cardSet1);
    repository.setCardSet(team2Name, cardSet2);
    let retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.unknownEstimationIndex).toBe(cardSet1.unknownEstimationIndex);
      expect(retrieved.cardSet).toBe(cardSet1.cardSet);
      expect(retrieved.cards.length).toBe(cardSet1.cards.length);
    }
    retrieved = repository.getCardSet(team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.unknownEstimationIndex).toBe(cardSet2.unknownEstimationIndex);
      expect(retrieved.cardSet).toBe(cardSet2.cardSet);
      expect(retrieved.cards.length).toBe(cardSet2.cards.length);
    }
  });

  test('update cardset for one team', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    repository.setCardSet(team1Name, cardSet1);
    repository.setCardSet(team2Name, cardSet2);
    repository.setCardSet(team2Name, cardSet3);
    let retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.unknownEstimationIndex).toBe(cardSet1.unknownEstimationIndex);
      expect(retrieved.cardSet).toBe(cardSet1.cardSet);
      expect(retrieved.cards.length).toBe(cardSet1.cards.length);
    }
    retrieved = repository.getCardSet(team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.unknownEstimationIndex).toBe(cardSet3.unknownEstimationIndex);
      expect(retrieved.cardSet).toBe(cardSet3.cardSet);
      expect(retrieved.cards.length).toBe(cardSet3.cards.length);
    }
  });

  test('delete cardset for a teams', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    repository.setCardSet(team1Name, cardSet1);
    repository.setCardSet(team2Name, cardSet2);
    expect(repository.removeCardSet(team1Name)).toBe(true);
    expect(repository.removeCardSet(team1Name)).toBe(false);
    let retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeUndefined();
    retrieved = repository.getCardSet(team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.unknownEstimationIndex).toBe(cardSet2.unknownEstimationIndex);
      expect(retrieved.cardSet).toBe(cardSet2.cardSet);
      expect(retrieved.cards.length).toBe(cardSet2.cards.length);
    }
  });

})

