import { expect, jest } from "@jest/globals"
import { IHandlerService } from "services/interfaces";
import { AClientMessage, AServerMessage, EErrorCode, EMemberChangeType, EParticipantStatus, EPokerStatus, ERole, EServerMessageType, IErrorMessage, IMemberChangeMessage, IPokerStatusChangedMessage } from "../../../../../shared-lib/src";

import { IServerParticipant } from "../../../../src/objects";

import { IWebSocket, ReadyState } from "../../../../src/services/websocket";

export interface IMemberChangedMessageCheckOptions {
  nick?: string;
  participantId?: string;
  observer?: boolean;
  role?: ERole;
  status?: EParticipantStatus;
}

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
   * Close the socket of the participant. This triggers IHandlerService.handleClose.
  */
  closeSocket(): void;

  /**
   * Count the number of IMemberChange messages of the given type
   * @param changeType - the type of member change
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default true
   * @returns the number found
   *
   * @deprecated use the message iterator to validate messages
  */
  countMemberChangedMessages(changeType: EMemberChangeType, skipInitialMessages?: boolean): number;

  /**
   * Count the number of messages of a given type
   * @param messageType - the message type
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default true
   * @returns the number found
   *
   * @deprecated use the message iterator to validate messages
  */
  countMessagesOfType(messageType: EServerMessageType, skipInitialMessages?: boolean): number;

  /**
   * Write the received messages as JSON to the console
   * * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default true
  */
  dumpMessages(skipInitialMessages?: boolean): IATestParticipant;

  /**
   * Check if an error message was received with the given error code. This method does not skip the initial messages
   * @param errorCode - The error code to be searched for
   * @returns true if the error message was found
   *
   * @deprecated use the message iterator to validate messages
  */
  errorMessageReceived(errorCode: EErrorCode): boolean;

  /**
   * validates the next message in the iterator using the parameters.
   * @param type - the message type. Uses jest.expect internally to validate that the type is correct
   * @param validation - a validation method that should use jest.expect
   */
  expectNextMessageIs<T extends AServerMessage>(type: EServerMessageType, validation?: ((message: T) => void)): IATestParticipant;

  /**
   * validates if the next message is an error message with the given error code.
   * @param errorCode - the expected error code
   */
  expectNextMessageIsError(errorCode: EErrorCode): IATestParticipant;

  expectNextMessageIsMemberChange(changeType: EMemberChangeType, options?: IMemberChangedMessageCheckOptions): IATestParticipant;
  expectNextMessageIsPokerStatus(status: EPokerStatus): IATestParticipant;

  /**
   * check if there are no more messages. Uses jest.expect internally
   */
  expectNoMoreMessages(): void;

  /**
   * Search for the x-th occurrence of a IMemberChangeMessage of the given change type
   * @param changeType - the type of member change
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default true
   * @param occurrence - 0-based
   *
   * @deprecated use the message iterator to validate messages
  */
  extractMemberChangedMessage(changeType: EMemberChangeType, skipInitialMessages?: boolean, occurrence?: number): IMemberChangeMessage | undefined;

  /**
   * Search for the x-th occurrence of a message of the given type
   * @param messageType - the message type
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default true
   * @param occurrence - 0-based
   * @returns the x-th occurrence or undefined
  */
  extractMessage<T = AServerMessage>(messageType: EServerMessageType, skipInitialMessages?: boolean, occurrence?: number): T | undefined;

  /**
   * Initializes the message iterator, so subsequent calls to 'expectNextMessageIs' or 'expectNoMoreMessages' can be executed
   * @param skipInitialMessages - pass 'true' when counting should start after the initial messages. Default true
   */
  initializeMessageIterator(skipInitialMessages?: boolean): IATestParticipant;

  /**
    * calls IHandlerService.handleMessage
    * @param message - a AClientMessage
    * @param teamName - the target team of the message. This sets the target for all subsequent calls. If undefined, the previous team is targetted
  */
  sendMessage(message: AClientMessage, teamName?: string): void;
}

export abstract class ATestParticipant implements IATestParticipant {

  //#region private properties ------------------------------------------------
  private readonly handlerService: IHandlerService;
  private currentMessageIndex: number | undefined;
  private messageIterator: Array<AServerMessage> | undefined;
  private participant: IServerParticipant;
  private send: jest.Mock<(_message: string) => void>;
  private teamName: string;
  //#endregion

  //#region protected getters -------------------------------------------------
  protected get allMessages(): Array<AServerMessage> {
    return this.send.mock.calls
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]));
  }

  protected get messagesAfterInitialMessages(): Array<AServerMessage> {
    return this.send.mock.calls
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .filter((_message: AServerMessage, idx: number) => idx >= this.expectedNumberOfInitialMessages)
  }
  //#endregion

  //#region IATestParticipant properties --------------------------------------
  public socket: IWebSocket;
  public expectedNumberOfInitialMessages: number;

  public get totalMessagesReceived(): number {
    return this.send.mock.calls.length;
  }

  public get messagesReceivedAfterInitial(): number {
    return this.send.mock.calls.length - this.expectedNumberOfInitialMessages;
  }

  public get participantId(): string {
    return this.participant.participantId;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(handlerService: IHandlerService, role = ERole.Developer) {
    this.handlerService = handlerService;
    this.send = jest.fn((_message: string) => this.noop());
    this.socket = {
      readyState: ReadyState.OPEN,
      close: jest.fn(undefined),
      send: this.send
    }
    this.participant = handlerService.handleConnect(this.socket);
    this.participant.role = role;
    this.expectedNumberOfInitialMessages = 0;
    this.teamName = '';
  }
  //#endregion

  //#region IATestParticipant Methods -----------------------------------------
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

  public dumpMessages(skipInitialMessages = true): IATestParticipant {
    /* eslint-disable no-console */
    if (skipInitialMessages) {
      console.log(JSON.stringify(this.send.mock.calls.slice(this.expectedNumberOfInitialMessages), null, 2));
    } else {
      console.log(JSON.stringify(this.send.mock.calls, null, 2));
    }
    /* eslint-enable no-console */
    return this;
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

  public initializeMessageIterator(skipInitialMessages = true): IATestParticipant {
    this.messageIterator = skipInitialMessages ? this.messagesAfterInitialMessages : this.allMessages;
    this.currentMessageIndex = 0;
    return this;
  }

  public expectNextMessageIs<T extends AServerMessage>(type: EServerMessageType, validation?: ((message: T) => void)): IATestParticipant {
    if ((this.currentMessageIndex === undefined) || !this.messageIterator) {
      throw Error('Initialize iterator first');
    } else {
      expect(this.currentMessageIndex).toBeLessThan(this.messageIterator.length);
      const message = this.messageIterator[this.currentMessageIndex];
      this.currentMessageIndex++;
      expect(message.type).toBe(type);
      if (validation) {
        validation(<T>message);
      }
    }
    return this;
  }

  public expectNextMessageIsError(errorCode: EErrorCode): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.Error, (m: IErrorMessage) => expect(m.data.code).toBe(errorCode));
  }

  public expectNextMessageIsMemberChange(changeType: EMemberChangeType, options?: IMemberChangedMessageCheckOptions): IATestParticipant {
    return this.expectNextMessageIs(
      EServerMessageType.MemberChanged,
      (m: IMemberChangeMessage) => {
        expect(m.data.memberStatusChange).toBe(changeType);
        if (options) {
          if (options.nick) {
            expect(m.data.member.nick).toBe(options.nick);
          }
          if (options.observer) {
            expect(m.data.member.observer).toBe(options.observer);
          }
          if (options.participantId) {
            expect(m.data.member.participantId).toBe(options.participantId);
          }
          if (options.role) {
            expect(m.data.member.role).toBe(options.role);
          }
          if (options.status) {
            expect(m.data.member.status).toBe(status);
          }
        }
      });
  }

  public expectNextMessageIsPokerStatus(status: EPokerStatus): IATestParticipant {
    return this.expectNextMessageIs(
      EServerMessageType.PokerStatus,
      (m: IPokerStatusChangedMessage) => expect(m.data).toBe(status)
    );
  }

  public expectNoMoreMessages(): void {
    if ((this.currentMessageIndex === undefined) || !this.messageIterator) {

      throw Error('Initialize iterator first');
    } else {
      expect(this.currentMessageIndex).toBe(this.messageIterator.length);
    }
  }
  public sendMessage(message: AClientMessage, teamName?: string): void {
    if (teamName) {
      this.teamName = teamName;
    }
    this.handlerService.handleMessage(message, this.teamName, this.socket);
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  private noop(..._args: Array<unknown>): void { }
  /* eslint-enable @typescript-eslint/no-empty-function */
  //#endregion
}