import { jest } from "@jest/globals"
import { IHandlerService } from "services/interfaces";
import { AClientMessage, AServerMessage, EErrorCode, EMemberChangeType, EServerMessageType, IErrorMessage, IMemberChangeMessage } from "../../../../../shared-lib/src";

import { IServerParticipant } from "../../../../src/objects";

import { IWebSocket, ReadyState } from "../../../../src/services/websocket";

export interface IATestParticipant {
  /**
   * Returns the server generated participantId (UUID) of the connected IServerParticipant
   */
  readonly participantId: string;

  /**
   * The socket used by the participant
   */
  readonly socket: IWebSocket;

  /**
   * The number of messages received after receiving the initial messages
   */
  readonly messagesReceivedAfterInitial: number;

  /**
   * The total number of messages received
   */
  readonly totalMessagesReceived: number;

  /**
   * The number of initial messages the participant should receive.
   * Value needs to be set in the constructor of descendant classes
   */
  readonly expectedNumberOfInitialMessages: number;

  /**
   * The teamname as it would be used in the URL
   */
  teamName: string;

  /**
   * Close the socket of the participant. This triggers IHandlerService.handleClose.
   */
  closeSocket(): void;

  /**
   * Count the number of IMemberChange messages of the given type
   * @param changeType - the type of member change
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default: yes
   * @returns the number found
   */
  countMemberChangedMessages(changeType: EMemberChangeType, skipInitialMessages?: boolean): number;

  /**
   * Count the number of messages of a given type
   * @param messageType - the message type
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default: yes
   * @returns the number found
   */
  countMessagesOfType(messageType: EServerMessageType, skipInitialMessages?: boolean): number;

  /**
   * Write the received messages as JSON to the console
   * * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default: yes
   */
  dumpMessages(skipInitialMessages?: boolean): void;

  /**
   * Check if an error message was received with the given error code. This method does not skip the initial messages
   * @param errorCode - The error code to be searched for
   * @returns true if the error message was found
   */
  errorMessageReceived(errorCode: EErrorCode): boolean;

  /**
   * Search for the x-th occurrence of a IMemberChangeMessage of the given change type
   * @param changeType - the type of member change
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default: yes
   * @param occurrence - 0-based
   */
  extractMemberChangedMessage(changeType: EMemberChangeType, skipInitialMessages?: boolean, occurrence?: number): IMemberChangeMessage | undefined;

  /**
   * Search for the x-th occurrence of a message of the given type
   * @param messageType - the message type
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default: yes
   * @param occurrence - 0-based
   * @returns the x-th occurrence or undefined
   */
  extractMessage<T = AServerMessage>(messageType: EServerMessageType, skipInitialMessages?: boolean, occurrence?: number): T | undefined;

  /**
   * calls IHandlerService.handleMessage
   * @param message - a AClientMessage
   */
  sendMessage(message: AClientMessage): void;
}

export abstract class ATestParticipant implements IATestParticipant {

  private participant: IServerParticipant;

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

  public expectedNumberOfInitialMessages: number;
  public teamName: string;

  public get totalMessagesReceived(): number {
    return this.send.mock.calls.length;
  }

  public get messagesReceivedAfterInitial(): number {
    return this.send.mock.calls.length - this.expectedNumberOfInitialMessages;
  }

  public get participantId(): string {
    return this.participant.participantId;
  }

  private readonly handlerService: IHandlerService;

  public constructor(handlerService: IHandlerService) {
    this.handlerService = handlerService;
    this.send = jest.fn((_message: string) => this.noop());
    this.socket = {
      readyState: ReadyState.OPEN,
      close: jest.fn(undefined),
      send: this.send
    }
    this.participant = handlerService.handleConnect(this.socket);
    this.expectedNumberOfInitialMessages = 0;
    this.teamName = '';
  }

  public closeSocket(): void {
    this.handlerService.handleClose(this.socket);
    this.socket.readyState == ReadyState.CLOSED;
  }

  public countMemberChangedMessages(changeType: EMemberChangeType, skipInitialMessages?: boolean): number {
    const allMemberChangedMessages = skipInitialMessages ?
      this.messagesAfterInitialMessages.filter((message: AServerMessage) => message.type === EServerMessageType.MemberChanged) :
      this.allMessages.filter((message: AServerMessage) => message.type === EServerMessageType.MemberChanged);

    return allMemberChangedMessages
      .map((m: AServerMessage) => <IMemberChangeMessage>m)
      .filter((m: IMemberChangeMessage) => m.data.memberStatusChange === changeType)
      .length;
  }

  public countMessagesOfType(messageType: EServerMessageType, skipInitialMessages = true): number {
    return skipInitialMessages ?
      this.messagesAfterInitialMessages.filter((message: AServerMessage) => message.type === messageType).length :
      this.allMessages.filter((message: AServerMessage) => message.type === messageType).length;
  }

  public dumpMessages(skipInitialMessages = true): void {
    /* eslint-disable no-console */
    if (skipInitialMessages) {
      console.log(JSON.stringify(this.send.mock.calls.slice(this.expectedNumberOfInitialMessages), null, 2));
    } else {
      console.log(JSON.stringify(this.send.mock.calls, null, 2));
    }
    /* eslint-enable no-console */
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

  public extractMemberChangedMessage(changeType: EMemberChangeType, skipInitialMessages = true, occurrence = 0): IMemberChangeMessage | undefined {
    const allMemberChangedMessages = skipInitialMessages ?
      this.messagesAfterInitialMessages.filter((message: AServerMessage) => message.type === EServerMessageType.MemberChanged) :
      this.allMessages.filter((message: AServerMessage) => message.type === EServerMessageType.MemberChanged);

    const messageOfGivenChangeType = allMemberChangedMessages
      .map((m: AServerMessage) => <IMemberChangeMessage>m)
      .filter((m: IMemberChangeMessage) => m.data.memberStatusChange === changeType);
    return messageOfGivenChangeType.length >= occurrence ? messageOfGivenChangeType[occurrence] : undefined
  }

  public sendMessage(message: AClientMessage): void {
    this.handlerService.handleMessage(message, this.teamName, this.socket);
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  private noop(..._args: Array<unknown>): void { }
  /* eslint-enable @typescript-eslint/no-empty-function */
}