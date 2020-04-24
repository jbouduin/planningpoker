import * as Collections from 'typescript-collections';

import { DtoCard, DtoEstimation, DtoGame, DtoParticipant } from '../../../../projects/shared-lib/lib';
import { ErrorCode, GameStatus, ParticipantStatus, Reason, Role } from '../../../../projects/shared-lib/lib';

import { Card } from './card';
import { Estimation } from './estimation';
import { Participant } from './participant';

export interface Game {

  // <editor-fold desc='Public Readonly properties'>
  readonly availableCards: Array<Card>;
  readonly canEstimate: boolean;
  readonly canReconnect: boolean;
  readonly canReveal: boolean;
  readonly canStart: boolean;
  readonly developers: Array<Participant>;
  readonly estimations: Array<Estimation>;
  readonly myNick: string;
  readonly myRole: Role;
  readonly myUuid: string;
  readonly scrumMaster: Participant | undefined;
  readonly status: GameStatus;
  readonly team: string;
  // </editor-fold>

  clearEstimations(): void;
  handleErrorMessage(code: ErrorCode): boolean;
  handleEstimations(dtoEstimations: Array<DtoEstimation>): void;
  handleSelf(participant: DtoParticipant): void;
  handleParticipants(participants: Array<DtoParticipant>, reason: Reason): void
  reset(): void;
  setCards(cards: Array<DtoCard>): void;
  showError(messageKey: string): void
  showInfo(messageKey: string): void;
  showSuccess(messageKey: string): void;
  showWarning(messageKey: string): void;
  update(dtoGame: DtoGame): void;
}
