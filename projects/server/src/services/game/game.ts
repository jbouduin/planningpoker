import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';

import { Participant } from './participant';
import { Role } from '../../../../shared-lib/lib';

export class Game {

  public name: string;

  private cnt: number;
  private participantsDictionary: Collections.Dictionary<string, Participant>;

  // constructor
  public constructor(name: string) {
    this.name = name;
    this.participantsDictionary = new Collections.Dictionary<string, Participant>();
    this.cnt = 0;
  }

  public addNewParticipant(ws: any): Participant {
    const uuid = Uuid();
    const newParticipant = new Participant(
      `participant ${++this.cnt}`,
      uuid,
      this.participantsDictionary.size() > 0 ? Role.Developer : Role.ScrumMaster,
      ws);
    this.participantsDictionary.setValue(uuid, newParticipant);
    return newParticipant;
  }

  public remove(uuid: string): void {
    this.participantsDictionary.remove(uuid);
  }

  public size(): number {
    return this.participantsDictionary.size();
  }

  public getParticipant(key: string): Participant {
    return this.participantsDictionary.getValue(key);
  }

  public participants(filter: (participant: Participant) => boolean): Array<Participant> {
    return this.participantsDictionary.values().filter(filter);
  }

}
