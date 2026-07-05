import { CardSetDto, CreateDto, JoinDto, ToggleObserverDto } from '../dto';
import { EClientMessageType } from './client-message-type.enum';

export interface ClientMessageDto<T> {
  data: T;
  senderId: string;
  type: EClientMessageType;
}

/**
 * Message to send the cardset to be used
 *
 * Contains the new cardset definition
 */
export type ChangeCardSetMessageDto = ClientMessageDto<CardSetDto>;
/**
 * Message to change a participant's __own__ nickname
 *
 * Contains the new nick name
 */
export type ChangeNickMessageDto = ClientMessageDto<string>;
/**
 * Message to assign the scrum master role to a participant
 *
 * Contains the participant ID of the new scrum master
 */
export type ChangeScrumMasterMessageDto = ClientMessageDto<string>;
/**
 * Message to clear the estimations, __without changing the game state__
 *
 * Contains no data
 */
export type ClearEstimationsMessageDto = ClientMessageDto<void>;
/**
 * Message to create a new session.
 */
export type CreateMessageDto = ClientMessageDto<CreateDto>;
/**
 * Message to give an estimation
 *
 * Contains the index value of the card. This is __NOT__ the index of the card in the array of cards
 */
export type EstimateMessageDto = ClientMessageDto<number>;
/**
 * Message to disband a team.
 *
 * Contains the teamName
 */
export type DisbandMessageDto = ClientMessageDto<string>;
/**
 * Message to join an existing session/team
 */
export type JoinMessageDto = ClientMessageDto<JoinDto>;
/**
 * Message to leave a session
 *
 * Contains the leaving participant's ID. In case of a previously disconnected user, that does not want to rejoin
 * this ID wil be different from the sender's id.
 */
export type LeaveMessageDto = ClientMessageDto<string>;
/**
 * Message to toggle the observer flag of a participant.
 *
 * Contains a participant's ID and the flag value
 */
export type ToggleObserverMessageDto = ClientMessageDto<ToggleObserverDto>;
/**
 * Message to take a break.
 *
 * Contains no data
 */
export type PauseMessageDto = ClientMessageDto<void>;
/**
 * Message to rejoin a session
 *
 * Contains the participant ID
 */
export type RejoinMessageDto = ClientMessageDto<string>;
/**
 * Message to remove a participant
 *
 * Contains the ID of the participant to remove
 */
export type RemoveParticipantMessageDto = ClientMessageDto<string>;
/**
 * Message to set the game state to revealed
 *
 * Contains no data
 */
export type RevealMessageDto = ClientMessageDto<void>;
/**
 * Message to change the game state to started
 */
export type StartMessageDto = ClientMessageDto<void>;
/**
 * Message to withdraw a previously given estimation
 *
 * Contains no data
 */
export type WithDrawMessageDto = ClientMessageDto<void>;

export type AClientMessageDto =
  | ChangeCardSetMessageDto
  | ChangeNickMessageDto
  | ChangeScrumMasterMessageDto
  | ClearEstimationsMessageDto
  | CreateMessageDto
  | EstimateMessageDto
  | JoinMessageDto
  | ToggleObserverMessageDto
  | PauseMessageDto
  | LeaveMessageDto
  | RejoinMessageDto
  | RemoveParticipantMessageDto
  | RevealMessageDto
  | StartMessageDto
  | WithDrawMessageDto;
