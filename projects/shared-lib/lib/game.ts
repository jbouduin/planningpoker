import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';

import { Participant } from './participant';

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
    const newParticipant = new Participant();
    newParticipant.nick = `participant ${++this.cnt}`;
    newParticipant.uuid = uuid;
    // newParticipant.role: boolean;
    newParticipant.socket = ws;
    this.participantsDictionary.setValue(uuid, newParticipant);
    return newParticipant;
  }

  public remove(uuid): void {
    this.participantsDictionary.remove(uuid);
  }

  public size(): number {
    return this.participantsDictionary.size();
  }

  public participants(filter: (Participant) => boolean): Array<Participant> {
    return this.participantsDictionary.values().filter(filter);
  }
}
