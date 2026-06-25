import { injectable } from 'inversify';
import { IServerParticipant } from '../../objects';
import { IServerParticipantRepository } from '../interfaces';

@injectable()
export class ServerParticipantRepository implements IServerParticipantRepository {
  //#region private properties ------------------------------------------------
  private readonly participants: Map<string, IServerParticipant>;
  private cnt: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.participants = new Map<string, IServerParticipant>();
    this.cnt = 0;
  }
  //#endregion

  //#region IBaseRepository methods -------------------------------------------
  public add(entity: IServerParticipant): void {
    this.participants.set(entity.participantId, entity);
  }

  public remove(id: string): void {
    this.participants.delete(id);
  }

  public get(id: string): IServerParticipant | undefined {
    return this.participants.get(id);
  }

  public getAll(): Array<IServerParticipant> {
    return Array.from(this.participants.values());
  }

  public exists(id: string): boolean {
    return this.participants.has(id);
  }
  //#endregion
}
