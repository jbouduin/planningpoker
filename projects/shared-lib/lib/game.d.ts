import { Participant } from './participant';
export declare class Game {
    name: string;
    private cnt;
    private participantsDictionary;
    constructor(name: string);
    addNewParticipant(ws: any): Participant;
    remove(uuid: any): void;
    size(): number;
    participants(filter: (Participant: any) => boolean): Array<Participant>;
}
//# sourceMappingURL=game.d.ts.map