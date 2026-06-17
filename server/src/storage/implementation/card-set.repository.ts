
import { injectable } from "inversify";

import { ICardSet } from "shared-lib";
import { ICardSetRepository } from "../interfaces";

@injectable()
export class CardSetRepository implements ICardSetRepository{

  //#region private properties ------------------------------------------------
  private readonly cardSets: Map<string, ICardSet>;
  //#endregion

  //#region constructor & C° --------------------------------------------------
  public constructor() {
    this.cardSets = new Map<string, ICardSet>();
  }
  //#endregion

  //#region ICardSetRepository methods ----------------------------------------
  public removeCardSet(teamName: string): boolean {
    return this.cardSets.delete(teamName);
  }

  public getCardSet(teamName: string): ICardSet | undefined {
    return this.cardSets.get(teamName)
  }

  public setCardSet(teamName: string, cardSet: ICardSet): void{
    this.cardSets.set(teamName, cardSet);
  }
  //#endregion
}
