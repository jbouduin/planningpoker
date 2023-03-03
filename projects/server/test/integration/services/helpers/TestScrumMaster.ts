import { jest } from "@jest/globals"

import { IServerParticipant } from "../../../../src/objects";

import { IWebSocket } from "../../../../src/services/websocket";
import { ATestParticipant, IATestParticipant } from "./ATestParticipant";

export type ITestScrumMaster = IATestParticipant;

export class TestScrumMaster extends ATestParticipant implements ITestScrumMaster {
  public constructor(send: jest.Mock<(_message: string) => void>, socket: IWebSocket, participant: IServerParticipant) {
    super(send, socket, participant);
    this.expectedNumberOfInitialMessages = 6;
  }
}

