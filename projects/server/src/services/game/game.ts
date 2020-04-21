import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';

import { Participant } from './participant';
import { Role } from '../../../../shared-lib/lib';

export class Game {

  // private properties
  private participants: Collections.Dictionary<string, Participant>;

  // constructor
  public constructor(public team: string) {
    this.team = team;
    this.participants = new Collections.Dictionary<string, Participant>();
  }

  // insert a new participant or update an existing one
  public upsertParticipant(participant: Participant) {
    this.participants.setValue(participant.uuid, participant);
  }

  // remove a participant from the game
  public deleteParticipant(uuid: string): void {
    this.participants.remove(uuid);
  }

  // the number of participants
  public size(): number {
    return this.participants.size();
  }

  public getParticipant(uuid: string): Participant | undefined {
    return this.participants.getValue(uuid);
  }

  public filterParticipants(filter: (participant: Participant) => boolean): Array<Participant> {
    return this.participants.values().filter(filter);
  }

}
