import { describe, expect, test } from '@jest/globals';

import { FactoryService } from '../../../src/storage/implementation/factory.service';
import { IFactoryService } from '../../../src/storage/interfaces/factory.service';
import { CardSetRepository } from '../../../src/storage/implementation/card-set.repository';
import { ICardSetRepository } from '../../../src/storage/interfaces/card-set.repository';
import { ECardSet } from '../../../../shared-lib/src';

const team1Name = 'team1';
const team2Name = 'team2';

describe('CRUD', () => {

  test('Create', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService;
    const cohn = factory.createCardSet(ECardSet.Cohn);
    repository.setCardSet(team1Name, cohn);
    const retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(cohn.cardSet);
      expect(retrieved.cards.length).toBe(cohn.cards.length);
    }
  });

  test('Update', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService;
    const cohn = factory.createCardSet(ECardSet.Cohn);
    const fibo = factory.createCardSet(ECardSet.Fibonacci);
    repository.setCardSet(team1Name, cohn);
    repository.setCardSet(team1Name, fibo);
    const retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(fibo.cardSet);
      expect(retrieved.cards.length).toBe(fibo.cards.length);
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
    const factory: IFactoryService = new FactoryService;
    const cohn = factory.createCardSet(ECardSet.Cohn);
    repository.setCardSet(team1Name, cohn);

    expect(repository.removeCardSet(team1Name)).toBe(true);
    const retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeUndefined();

  });

});

describe('Two teams', () => {
  test('create cardset for two teams', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService;
    const cohn = factory.createCardSet(ECardSet.Cohn);
    const fibo = factory.createCardSet(ECardSet.Fibonacci);
    repository.setCardSet(team1Name, cohn);
    repository.setCardSet(team2Name, fibo);
    let retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(cohn.cardSet);
      expect(retrieved.cards.length).toBe(cohn.cards.length);
    }
    retrieved = repository.getCardSet(team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(fibo.cardSet);
      expect(retrieved.cards.length).toBe(fibo.cards.length);
    }
  });

  test('update cardset for one team', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService;
    const cohn = factory.createCardSet(ECardSet.Cohn);
    const fibo = factory.createCardSet(ECardSet.Fibonacci);
    const tshirt = factory.createCardSet(ECardSet.TShirt);
    repository.setCardSet(team1Name, cohn);
    repository.setCardSet(team2Name, fibo);
    repository.setCardSet(team2Name, tshirt);
    let retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(cohn.cardSet);
      expect(retrieved.cards.length).toBe(cohn.cards.length);
    }
    retrieved = repository.getCardSet(team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(tshirt.cardSet);
      expect(retrieved.cards.length).toBe(tshirt.cards.length);
    }
  });

  test('delete cardset for a teams', () => {
    const repository: ICardSetRepository = new CardSetRepository();
    const factory: IFactoryService = new FactoryService;
    const cohn = factory.createCardSet(ECardSet.Cohn);
    const fibo = factory.createCardSet(ECardSet.Fibonacci);
    repository.setCardSet(team1Name, cohn);
    repository.setCardSet(team2Name, fibo);
    expect(repository.removeCardSet(team1Name)).toBe(true);
    expect(repository.removeCardSet(team1Name)).toBe(false);
    let retrieved = repository.getCardSet(team1Name);
    expect(retrieved).toBeUndefined();
    retrieved = repository.getCardSet(team2Name);
    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.cardSet).toBe(fibo.cardSet);
      expect(retrieved.cards.length).toBe(fibo.cards.length);
    }
  });

})

