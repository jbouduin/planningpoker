import { injectable } from 'inversify';
import { CardSetDto } from 'shared-lib';
import type { ICardSetRepository } from '../interfaces/index.js';

@injectable()
export class CardSetRepository implements ICardSetRepository {
  //#region private properties ------------------------------------------------
  private readonly cardSets: Map<string, CardSetDto>;
  //#endregion

  //#region constructor & C° --------------------------------------------------
  public constructor() {
    this.cardSets = new Map<string, CardSetDto>();
  }
  //#endregion

  //#region ICardSetRepository methods ----------------------------------------
  public removeCardSet(teamName: string): boolean {
    return this.cardSets.delete(teamName);
  }

  public getCardSet(teamName: string): CardSetDto | undefined {
    return this.cardSets.get(teamName);
  }

  public setCardSet(teamName: string, cardSet: CardSetDto): void {
    this.cardSets.set(teamName, cardSet);
  }
  //#endregion
}
