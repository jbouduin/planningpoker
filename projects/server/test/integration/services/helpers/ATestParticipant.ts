import { jest } from "@jest/globals"
import { AServerMessage, EErrorCode, EMemberStatusChange, EServerMessageType, IErrorMessage, IMemberChangedMessage } from "../../../../../shared-lib/src";

import { IServerParticipant } from "../../../../src/objects";

import { IWebSocket } from "../../../../src/services/websocket";

export interface IATestParticipant {
  readonly participantId: string;
  readonly send: jest.Mock<(_message: string) => void>;
  readonly socket: IWebSocket;
  readonly participant: IServerParticipant;
  readonly messagesReceivedAfterInitial: number;
  readonly totalMessagesReceived: number;
  readonly expectedNumberOfInitialMessages: number;

  countMemberChangedMessages(changeType: EMemberStatusChange, skipInitialMessages?: boolean): number;
  countMessageType(messageType: EServerMessageType, skipInitialMessages?: boolean): number;

  errorMessageReceived(errorCode: EErrorCode): boolean;
  extractMemberChangedMessage(changeType: EMemberStatusChange, skipInitialMessages?:boolean, occurrence?: number): IMemberChangedMessage | undefined;
  extractMessage<T = AServerMessage>(messageType: EServerMessageType, skipInitialMessages?: boolean, occurrence?: number): T | undefined;
}

export abstract class ATestParticipant implements IATestParticipant {

  protected get allMessages(): Array<AServerMessage> {
    return this.send.mock.calls
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]));
  }

  protected get messagesAfterInitialMessages(): Array<AServerMessage> {
    return this.send.mock.calls
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .filter((_message: AServerMessage, idx: number) => idx >= this.expectedNumberOfInitialMessages)
  }

  public send: jest.Mock<(_message: string) => void>;
  public socket: IWebSocket;
  public participant: IServerParticipant;
  public expectedNumberOfInitialMessages: number;

  public get totalMessagesReceived(): number  {
    return this.send.mock.calls.length;
  }

  public get messagesReceivedAfterInitial(): number {
    return this.send.mock.calls.length - this.expectedNumberOfInitialMessages;
  }

  public get participantId(): string {
    return this.participant.participantId;
  }

  public constructor(send: jest.Mock<(_message: string) => void>, socket: IWebSocket, participant: IServerParticipant) {
    this.send = send;
    this.socket = socket;
    this.participant = participant;
    this.expectedNumberOfInitialMessages = 0;
  }

  public countMemberChangedMessages(changeType: EMemberStatusChange, skipInitialMessages?: boolean): number {
    const allMemberChangedMessages = skipInitialMessages ?
      this.messagesAfterInitialMessages.filter((message: AServerMessage) => message.type === EServerMessageType.MemberChanged) :
      this.allMessages.filter((message: AServerMessage) => message.type === EServerMessageType.MemberChanged);

    return allMemberChangedMessages
      .map((m: AServerMessage) => <IMemberChangedMessage>m)
      .filter((m: IMemberChangedMessage) => m.data.memberStatusChange === changeType)
      .length;
  }

  public countMessageType(messageType: EServerMessageType, skipInitialMessages = true): number {
    return skipInitialMessages ?
      this.messagesAfterInitialMessages.filter((message: AServerMessage) => message.type === messageType).length :
      this.allMessages.filter((message: AServerMessage) => message.type === messageType).length;
  }

  public errorMessageReceived(errorCode: EErrorCode): boolean {
    const errorMessage = this.extractMessage<IErrorMessage>(EServerMessageType.Error, false);
    return (errorMessage !== undefined) && errorMessage.data.code === errorCode;
  }

  public extractMessage<T = AServerMessage>(messageType: EServerMessageType, skipInitialMessages = true, occurrence = 0): T | undefined {
    const allMessagesOfType = skipInitialMessages ?
      this.messagesAfterInitialMessages.filter((message: AServerMessage) => message.type === messageType) :
      this.allMessages.filter((message: AServerMessage) => message.type === messageType);

    return allMessagesOfType.length >= occurrence ? <T>allMessagesOfType[occurrence] : undefined
  }

  public extractMemberChangedMessage(changeType: EMemberStatusChange, skipInitialMessages = true, occurrence = 0): IMemberChangedMessage | undefined {
    const allMemberChangedMessages = skipInitialMessages ?
      this.messagesAfterInitialMessages.filter((message: AServerMessage) => message.type === EServerMessageType.MemberChanged) :
      this.allMessages.filter((message: AServerMessage) => message.type === EServerMessageType.MemberChanged);

    const messageOfGivenChangeType = allMemberChangedMessages
      .map((m: AServerMessage) => <IMemberChangedMessage>m)
      .filter((m: IMemberChangedMessage) => m.data.memberStatusChange === changeType);
    return messageOfGivenChangeType.length >= occurrence ? messageOfGivenChangeType[occurrence] : undefined
  }

}