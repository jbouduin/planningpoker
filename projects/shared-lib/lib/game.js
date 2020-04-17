"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Collections = require("typescript-collections");
const uuid_1 = require("uuid");
const participant_1 = require("./participant");
class Game {
    // constructor
    constructor(name) {
        this.name = name;
        this.participantsDictionary = new Collections.Dictionary();
        this.cnt = 0;
    }
    addNewParticipant(ws) {
        const uuid = uuid_1.v4();
        const newParticipant = new participant_1.Participant();
        newParticipant.nick = `participant ${++this.cnt}`;
        newParticipant.uuid = uuid;
        // newParticipant.role: boolean;
        newParticipant.socket = ws;
        this.participantsDictionary.setValue(uuid, newParticipant);
        return newParticipant;
    }
    remove(uuid) {
        this.participantsDictionary.remove(uuid);
    }
    size() {
        return this.participantsDictionary.size();
    }
    participants(filter) {
        return this.participantsDictionary.values().filter(filter);
    }
}
exports.Game = Game;
