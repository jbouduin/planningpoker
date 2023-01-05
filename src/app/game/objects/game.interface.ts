import { DtoCard, DtoEstimation, DtoGame, DtoParticipant } from '@shared-lib';
import { ErrorCode, GameStatus, Reason, Role } from '@shared-lib';

import { Card } from './card';
import { Estimation } from './estimation';
import { Participant } from './participant';

export interface IGame {

  //#region  Public Readonly properties
  readonly availableCards: Array<Card>;
  readonly canReconnect: boolean;
  readonly canEstimate: boolean;
  readonly developers: Array<Participant>;
  readonly enabled: boolean;
  readonly estimations: Array<Estimation>;
  readonly myNick: string;
  readonly myRole: Role;
  readonly myUuid: string;
  readonly observers: Array<Participant>;
  readonly scrumMaster: Participant | undefined;
  readonly showReveal: boolean;
  readonly showStart: boolean;
  readonly status: GameStatus;
  readonly team: string;
  //#endregion

  clearEstimations(): void;
  handleDisconnect(): void;
  handleErrorMessage(code: ErrorCode): boolean;
  handleEstimations(dtoEstimations: Array<DtoEstimation>): void;
  handleSelf(participant: DtoParticipant): void;
  handleSocketError(error: any): void; // eslint-disable-line
  handleParticipants(participants: Array<DtoParticipant>, reason: Reason): void
  reset(): void;
  setCards(cards: Array<DtoCard>): void;
  showError(errorCode: ErrorCode): void
  showInfo(errorCode: ErrorCode): void;
  showWarning(errorCode: ErrorCode): void;
  update(dtoGame: DtoGame): void;
}
