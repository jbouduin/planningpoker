import { injectable } from "inversify";

import { Participant } from "../../objects";
import { IParticipantRepository } from "../../storage/interfaces";

@injectable()
export class ParticipantRepository implements IParticipantRepository{

  //#region private properties ------------------------------------------------
  private readonly participants: Map<string, Participant>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.participants = new Map<string, Participant>();
  }
  //#endregion

  //#region IBaseRepository methods -------------------------------------------
  public add(entity: Participant): void {
    this.participants.set(entity.uuid, entity);
  }

  public remove(id: string): void {
    this.participants.delete(id);
  }

  public get(id: string): Participant | undefined {
    return this.participants.get(id);
  }

  public getAll(): Array<Participant> {
    return Array.from(this.participants.values());
  }

  public exists(id: string): boolean {
    return this.participants.has(id);
  }
  //#endregion
}