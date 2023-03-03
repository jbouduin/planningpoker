import { jest } from "@jest/globals"
import { AServerMessage } from "../../../../../shared-lib/src";

import { IServerParticipant } from "../../../../src/objects";

import { IWebSocket } from "../../../../src/services/websocket";

export class TestParticipant {
  public readonly send: jest.Mock<(_message: string) => void>;
  public readonly socket: IWebSocket;
  public readonly participant: IServerParticipant;

  private createCalls: number;
  private joinCalls: number;

  public get messagesAfterInit(): Array<AServerMessage> {
    return this.send.mock.calls
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .filter((_message: AServerMessage, idx: number) => idx > 0)
  }

  public get messagesAfterCreate(): Array<AServerMessage> {
    return this.send.mock.calls
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .filter((_message: AServerMessage, idx: number) => idx >= this.createCalls)
  }

  public get messagesAfterJoin(): Array<AServerMessage> {
    return this.send.mock.calls
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .filter((_message: AServerMessage, idx: number) => idx >= this.joinCalls);
  }

  public get participantId(): string {
    return this.participant.participantId;
  }

  public get numberOfCalls(): number {
    return this.send.mock.calls.length;
  }

  public get numberOfCallsAfterCreate(): number {
    return this.send.mock.calls.length - this.createCalls;
  }

  public get numberOfCallsAfterJoin(): number {
    return this.send.mock.calls.length - this.joinCalls;
  }

  public constructor(send: jest.Mock<(_message: string) => void>, socket: IWebSocket, participant: IServerParticipant) {
    this.send = send;
    this.socket = socket;
    this.participant = participant;
    this.createCalls = 6;
    this.joinCalls = 6;
  }

}