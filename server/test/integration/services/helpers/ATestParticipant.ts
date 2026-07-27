import { expect, jest } from '@jest/globals';
import {
  AClientMessageDto,
  AServerMessageDto,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  EParticipantState,
  ERole,
  EServerMessageType,
  ESessionEndedReason,
  ErrorMessageDto,
  GameStateChangedMessageDto,
  ParticipantChangedMessageDto,
  ParticipantDto,
  SelfMessageDto,
  SessionEndedMessageDto,
  StartHandshakeMessageDto
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
   * Write the next message to the console
   */
  dumpNextMessage(): IATestParticipant;

  /**
   * Write the received messages to the console.
   * This method is banned and only to be used for debugging
   * @param skipInitSequence - If set to false, the initial message sequence is dumped also. Default true
   * @param skipPostInitSequence - If set to false, the post initial message sequence is dumped also. Default true
   */
  dumpMessages(skipInitSequence?: boolean, skipPostInitSequence?: boolean): IATestParticipant;

  /**
   * Dumps the remaining messages in the queue.
   */
  dumpRemainingMessages(): IATestParticipant;

  /**
   * Expects the next message to be of the given type, calling the validation function if defined.
   * Sets the pointer to the next message in the queue
   *
   * @param type - the message type. Uses jest.expect internally to validate that the type is correct
   * @param validation - a validation method. The method has to use jest.expect
   */
  expectNextMessageIs<T extends AServerMessageDto>(
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
  expectNextMessageIsGameStateChanged(status: EGameState): IATestParticipant;

  /**
   * Expects the next message to be a self message.
   * Sets the pointer to the next message in the queue
   *
   * If no options are provided, or the participantId in the options is not set,
   * the methods expects the participantId to be the same value as the property participantId

   * @param options - ParticipantDtoOptions with expected values
   */
  expectNextMessageIsSelf(options?: ParticipantDtoOptions): IATestParticipant;

  expectNextMessageIsSessionEnded(reason: ESessionEndedReason): IATestParticipant;

  /**
   * Expects the next message to be an init message.
   * @param options - ParticipantDtoOptions with expected values
   */
  expectNextMessageIsStartHandshake(options?: ParticipantDtoOptions): IATestParticipant;

  /**
   * Expects that there are no more messages available.
   */
  expectNoMoreMessages(): void;

  /**
   * Sets the pointer to the next message to the first one in the queue.
   * @param skipInitSequence - pass `false` when next message should be the first. Default true
   * @param skipPostInitSequence - pass `false`, when next message should the first the first after the init sequence. Default true
   */
  initializeMessageQueue(skipInitSequence?: boolean, skipPostInitSequence?: boolean): IATestParticipant;

  /**
   * calls IHandlerService.handleMessage
   * @param message - a AClientMessage
   * @param teamName - the target team of the message. This sets the target for all subsequent calls. If undefined, the previously set team is targetted
   */
  sendMessage(message: AClientMessageDto, teamName?: string): void;

  /**
   * Increase the current message index with number.
   * If this would go over the end of the message queue it makes the test fail
   * @param count the number of messages to skip
   */
  skip(count: number): IATestParticipant;
}

export abstract class ATestParticipant implements IATestParticipant {
  //#region private properties ------------------------------------------------
  private readonly handlerService: IHandlerService;
  private currentMessageIndex: number | undefined;
  private messageIterator: Array<AServerMessageDto> | undefined;
  private participant: IServerParticipant;
  private send: jest.Mock<(_message: string) => void>;
  private teamName: string;
  //#endregion

  //#region protected properties ----------------------------------------------
  protected initSequenceLength: number;
  protected postInitSequenceLength: number;
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
    this.teamName = '';
    this.initSequenceLength = 0;
    this.postInitSequenceLength = 0;
  }
  //#endregion

  //#region IATestParticipant Methods -----------------------------------------
  public closeSocket(): void {
    this.handlerService.handleClose(this.socket);
    this.socket.readyState == ReadyState.CLOSED;
  }

  public dumpNextMessage(): IATestParticipant {
    this.validateQueue();
    // eslint-disable-next-line no-console
    console.log(this.messageIterator![this.currentMessageIndex!]);
    return this;
  }

  public dumpMessages(skipInitSequence = true, skipPostInitSequence = true): IATestParticipant {
    let skip = 0;

    if (skipInitSequence) {
      skip += this.initSequenceLength;
      if (skipPostInitSequence) {
        skip += this.postInitSequenceLength;
      }
    }

    // console.log(JSON.stringify(this.send.mock.calls.slice(skip), null, 2));
    // eslint-disable-next-line no-console
    console.log(this.send.mock.calls.slice(skip));

    return this;
  }

  public dumpRemainingMessages(): IATestParticipant {
    this.validateQueue();
    expect(this.currentMessageIndex).toBeLessThan(this.messageIterator!.length);
    // eslint-disable-next-line no-console
    console.log(this.messageIterator!.slice(this.currentMessageIndex));
    return this;
  }

  public initializeMessageQueue(skipInitSequence = true, skipPostInitSequence = true): IATestParticipant {
    let skip = 0;
    if (skipInitSequence) {
      skip += this.initSequenceLength;
      if (skipPostInitSequence) {
        skip += this.postInitSequenceLength;
      }
    }
    const allMessages = this.send.mock.calls.map(
      (message: [message: string]) => <AServerMessageDto>JSON.parse(message[0])
    );
    this.messageIterator = allMessages.slice(skip);
    this.currentMessageIndex = 0;
    return this;
  }

  /**
   *
   * @param type The `EServerMessageType`
   * @param validation The validation to run on the message. **Make sure to use `expect` in this method**
   * @returns `this`
   */
  public expectNextMessageIs<T extends AServerMessageDto>(
    type: EServerMessageType,
    validation?: (message: T) => void
  ): IATestParticipant {
    this.validateQueue();
    expect(this.currentMessageIndex).toBeLessThan(this.messageIterator!.length);
    const message = this.messageIterator![this.currentMessageIndex!];
    this.currentMessageIndex!++;
    expect(message.type).toBe(type);
    if (validation) {
      validation(<T>message);
    }

    return this;
  }

  public expectNextMessageIsError(errorCode: EErrorCode): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.Error, (m: ErrorMessageDto) =>
      expect(m.data.code).toBe(errorCode)
    );
  }

  public expectNextMessageIsMemberChange(
    changeType: EParticipantChangeType,
    options?: ParticipantDtoOptions
  ): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.ParticipantChanged, (m: ParticipantChangedMessageDto) => {
      expect(m.data.changeType).toBe(changeType);
      this.checkParticipantOptions(m.data.member, options);
    });
  }

  public expectNextMessageIsGameStateChanged(status: EGameState): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.GameStateChanged, (m: GameStateChangedMessageDto) =>
      expect(m.data.state).toBe(status)
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

    return this.expectNextMessageIs(EServerMessageType.Self, (m: SelfMessageDto) =>
      this.checkParticipantOptions(m.data, options)
    );
  }

  public expectNextMessageIsSessionEnded(reason: ESessionEndedReason): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.SessionEnded, (m: SessionEndedMessageDto) =>
      expect(m.data.reason).toBe(reason)
    );
  }

  public expectNextMessageIsStartHandshake(options?: ParticipantDtoOptions): IATestParticipant {
    return this.expectNextMessageIs(EServerMessageType.StartHandshake, (m: StartHandshakeMessageDto) => {
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

  public sendMessage(message: AClientMessageDto, teamName?: string): void {
    if (teamName) {
      this.teamName = teamName;
    }
    this.handlerService.handleMessage(message, this.teamName, this.socket);
  }

  public skip(count: number): IATestParticipant {
    this.validateQueue();
    expect(this.currentMessageIndex! + count).toBeLessThanOrEqual(this.messageIterator!.length);
    this.currentMessageIndex! += count;

    return this;
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
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

  /**
   * Check if
   * - the queue has been initialized → throws if not
   * - the current message index is less than the length of the queue using `expect`
   */
  private validateQueue(): void {
    if (this.currentMessageIndex === undefined || !this.messageIterator) {
      throw Error('Initialize iterator first');
    } else {
      expect(this.currentMessageIndex).toBeLessThan(this.messageIterator.length);
    }
  }
  //#endregion
}
