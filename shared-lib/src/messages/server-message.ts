import { EGameState, CardSetDto, ErrorDto, EstimationDto, ParticipantDto } from '../dto';
import { ParticipantChangeDto } from '../dto/participant-change.dto';
import { EServerMessageType } from './server-message-type.enum';
import { ESessionEndedReason } from './session-ended-reason.enum';

export interface ServerMessageDto<T> {
  data: T;
  type: EServerMessageType;
}

/**
 * Message
 * - __sent__ as part of the handshake
 * - __broadcasted__ when the cardset changes during a session
 *
 * Contains the cardset
 */
export type CardSetMessageDto = ServerMessageDto<CardSetDto>;
/**
 * Message __sent__ to indicate the end of the handshake
 *
 * Contains no data
 */
export type EndHandshakeMessageDto = ServerMessageDto<void>;
/**
 * Message __sent__ when an error occurred
 *
 * Contains the error
 */
export type ErrorMessageDto = ServerMessageDto<ErrorDto>;
/**
 * Message __broadcasted__ when the estimation list has been cleared
 *
 * Contains no data
 */
export type EstimationsClearedMessageDto = ServerMessageDto<void>;
/**
 * Message
 * - __sent__ after the handshake, containing an array of estimations
 * - __broadcasted__ after a participant has given an estimation, containing a signle element array with the given estimation
 */
export type EstimationListMessageDto = ServerMessageDto<Array<EstimationDto>>;
/**
 * Message __broadcasted__ after a participant has withdrawn a previously given estimation
 *
 * Contains the participant's id
 */
export type EstimationWithdrawnMessageDto = ServerMessageDto<string>;
/**
 * Message __broadcasted__ after the game state changed
 *
 * Contains the new game state
 */
export type GameStateChangedMessageDto = ServerMessageDto<EGameState>;
/**
 * Message __broadcasted__ to __other(!)__ participants if any participant's has changed
 *
 * Contains the change type and the modified participant's data.
 */
export type ParticipantChangedMessageDto = ServerMessageDto<ParticipantChangeDto>;
/**
 * Message __sent__ as part of the handshake
 *
 * Contains the complete participant list
 */
export type ParticipantListMessageDto = ServerMessageDto<Array<ParticipantDto>>;
/**
 * Message __broadcasted__ to all participants
 *
 * Contains no data
 */
export type PingMessageDto = ServerMessageDto<void>;
/**
 * Message
 * - __sent__ as part of the handshake
 * - __sent__  if a property of the participant has changed
 * This is independent from who triggered the change
 *
 * Contains the participant's own data.
 */
export type SelfMessageDto = ServerMessageDto<ParticipantDto>;
/**
 * Message __broadcasted__ when the session has ended
 *
 * Contains the reason of the end.
 */
export type SessionEndedMessageDto = ServerMessageDto<ESessionEndedReason>;
/**
 * Message __sent__ as start of the handshake
 *
 * Contains the participant's own, initial data
 */
export type StartHandshakeMessageDto = ServerMessageDto<ParticipantDto>;
/**
 * Message __sent__ as part of the handshake
 *
 * Contains the team name
 */
export type TeamNameMessageDto = ServerMessageDto<string>;

export type AServerMessageDto =
  | CardSetMessageDto
  | EndHandshakeMessageDto
  | ErrorMessageDto
  | EstimationsClearedMessageDto
  | EstimationListMessageDto
  | EstimationWithdrawnMessageDto
  | GameStateChangedMessageDto
  | ParticipantChangedMessageDto
  | ParticipantListMessageDto
  | PingMessageDto
  | SelfMessageDto
  | SessionEndedMessageDto
  | StartHandshakeMessageDto
  | TeamNameMessageDto;
