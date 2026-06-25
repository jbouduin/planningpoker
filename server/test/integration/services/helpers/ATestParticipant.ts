import { expect, jest } from '@jest/globals';
import {
  AClientMessage,
  AServerMessage,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  EParticipantState,
  ERole,
  EServerMessageType,
  IErrorMessage,
  IGameStateChangedMessage,
  IInitMessage,
  IParticipantChangedMessage,
  ISelfMessage,
  ParticipantDto
} from 'shared-lib';
import type { IServerParticipant } from '../../../../src/objects/interfaces/index.js';
import type { IHandlerService } from '../../../../src/services/interfaces/index.js';
import { IWebSocket, ReadyState } from '../../../../src/services/websocket.js';

export interface ParticipantDtoOptions {
  nick?: string;
  participantId?: string;
  observer?: boolean;
  role?: ERole;
  state?: EParticipantState;
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
   * Close the socket of the participant. This triggers IHandlerService.handleClose.
   */
  closeSocket(): void;

  /**
   * Write the received messages as JSON to the console.
   * This method is banned and only to be used for debugging
   * @param skipInitialMessages - If set to false, the initial message sequence is dumped also. Default true
   */
  dumpMessages(skipInitialMessages?: boolean): IATestParticipant;

  /**
   * Expects the next message to be of the given type, calling the validation function if defined.
   * Sets the pointer to the next message in the queue
   *
   * @param type - the message type. Uses jest.expect internally to validate that the type is correct
   * @param validation - a validation method. The method has to use jest.expect
   */
  expectNextMessageIs<T extends AServerMessage>(
    type: EServerMessageType,
    validation?: (message: T) => void
  ): IATestParticipant;

  /**
   * Expects the next message to be an with the given error code.
   * Sets the pointer to the next message in the queue
   *
   * @param errorCode - the expected error code
   */
  expectNextMessageIsError(errorCode: EErrorCode): IATestParticipant;

  /**
   * Expects the next message to be a member changed message.
   * Sets the pointer to the next message in the queue
   *
   * @param changeType - the expected change type
   * @param options - ParticipantDtoOptions with expected values
   */
  expectNextMessageIsMemberChange(
    changeType: EParticipantChangeType,
    options?: ParticipantDtoOptions
  ): IATestParticipant;

  /**
   * Expects the next message to be a poker status changed message with the given pokerstatus.
   * Sets the pointer to the next message in the queue
   *
   * @param status - the expected poker status
   */
  expectNextMessageIsPokerStatus(status: EGameState): IATestParticipant;

  /**
   * Expects the next message to be a self message.
   * Sets the pointer to the next message in the queue
   *
   * If no options are provided, or the participantId in the options is not set,
   * the methods expects the participantId to be the same value as the property participantId

   * @param options - ParticipantDtoOptions with expected values
   */
  expectNextMessageIsSelf(options?: ParticipantDtoOptions): IATestParticipant;

  /**
   * Expects the next message to be an init message.
   * @param options - ParticipantDtoOptions with expected values
   */
  expectNextMessageIsInit(options?: ParticipantDtoOptions): IATestParticipant;

  /**
   * Expects that there are no more messages available.
   */
  expectNoMoreMessages(): void;

  /**
   * Sets the pointer to the next message to the first one in the queue.
   * @param skipInitialMessages - pass 'false' when counting should start after the initial message sequence. Default true
   */
  initializeMessageQueue(skipInitialMessages?: boolean): IATestParticipant;

  /**
   * calls IHandlerService.handleMessage
   * @param message - a AClientMessage
   * @param teamName - the target team of the message. This sets the target for all subsequent calls. If undefined, the previously set team is targetted
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

  //#region protected properties ----------------------------------------------
  protected expectedNumberOfInitialMessages: number;
  protected get allMessages(): Array<AServerMessage> {
    return this.send.mock.calls.map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]));
  }

  protected get messagesAfterInitialMessages(): Array<AServerMessage> {
    return this.send.mock.calls
      .map((message: [message: string]) => <AServerMessage>JSON.parse(message[0]))
      .filter((_message: AServerMessage, idx: number) => idx >= this.expectedNumberOfInitialMessages);
  }
  //#endregion

  //#region IATestParticipant properties --------------------------------------
  public readonly socket: IWebSocket;

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
    };
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

  public initializeMessageQueue(skipInitialMessages = true): IATestParticipant {
    this.messageIterator = skipInitialMessages ? this.messagesAfterInitialMessages : this.allMessages;
    this.currentMessageIndex = 0;
    return this;
  }

  public expectNextMessageIs<T extends AServerMessage>(
    type: EServerMessageType,
    validation?: (message: T) => void
  ): IATestParticipant {
    if (this.currentMessageIndex === undefined || !this.messageIterator) {
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
    return this.expectNextMessageIs(EServerMessageType.Error, (m: IErrorMessage) =>
      expect(m.data.code).toBe(errorCode)
    );
  }

  public expectNextMessageIsMemberChange(
    changeType: EParticipantChangeType,
    options?: ParticipantDtoOptions
  ): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.MemberChanged, (m: IParticipantChangedMessage) => {
      expect(m.data.changeType).toBe(changeType);
      this.checkParticipantOptions(m.data.member, options);
    });
  }

  public expectNextMessageIsPokerStatus(status: EGameState): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.GameStateChanged, (m: IGameStateChangedMessage) =>
      expect(m.data).toBe(status)
    );
  }

  public expectNextMessageIsSelf(options?: ParticipantDtoOptions): IATestParticipant {
    if (!options) {
      options = { participantId: this.participantId };
    } else {
      if (!options.participantId) {
        options.participantId = this.participantId;
      }
    }

    return this.expectNextMessageIs(EServerMessageType.Self, (m: ISelfMessage) =>
      this.checkParticipantOptions(m.data, options)
    );
  }

  expectNextMessageIsInit(options?: ParticipantDtoOptions): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.Init, (m: IInitMessage) => {
      expect(m.data.nick.length).toBeGreaterThan(0);
      expect(m.data.participantId.length).toBeGreaterThan(0);
      this.checkParticipantOptions(m.data, options);
    });
  }
  public expectNoMoreMessages(): void {
    if (this.currentMessageIndex === undefined || !this.messageIterator) {
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

  //#endregion

  private checkParticipantOptions(participant: ParticipantDto, options?: ParticipantDtoOptions): void {
    if (options) {
      if (options.nick) {
        expect(participant.nick).toBe(options.nick);
      }
      if (options.observer) {
        expect(participant.observer).toBe(options.observer);
      }
      if (options.participantId) {
        expect(participant.participantId).toBe(options.participantId);
      }
      if (options.role) {
        expect(participant.role).toBe(options.role);
      }
      if (options.state) {
        expect(participant.state).toBe(options.state);
      }
    }
  }
  /* eslint-disable @typescript-eslint/no-empty-function */
  private noop(..._args: Array<unknown>): void {}
  /* eslint-enable @typescript-eslint/no-empty-function */
}
