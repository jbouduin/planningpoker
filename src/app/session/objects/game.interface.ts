import { ICard, IEstimation, IMemberStatusChange, IParticipant } from '@shared-lib';
import { EErrorCode, EGameStatus, ERole } from '@shared-lib';

import { Card } from './card';
import { Estimation } from './estimation';
import { Member } from './member';

export interface IGame {

  //#region Readonly properties -----------------------------------------------
  readonly availableCards: Array<Card>;
  readonly canReconnect: boolean;
  readonly canEstimate: boolean;
  readonly developers: Array<Member>;
  readonly enabled: boolean;
  readonly estimations: Array<Estimation>;
  readonly myNick: string;
  readonly myRole: ERole;
  readonly myUuid: string;
  readonly observers: Array<Member>;
  readonly scrumMaster: Member;
  readonly showReveal: boolean;
  readonly showForceReveal: boolean
  readonly showStart: boolean;
  readonly status: EGameStatus;
  readonly team: string;
  //#endregion

  //#region methods -----------------------------------------------------------
  clearEstimations(): void;
  handleDisconnect(): void;
  handleErrorMessage(code: EErrorCode): boolean;
  handleEstimations(dtoEstimations: Array<IEstimation>): void;
  handleSelf(participant: IParticipant): void;
  handleSocketError(error: any): void; // eslint-disable-line
  handleMemberChanged(memberChange: IMemberStatusChange): void
  handleMemberList(memberList: Array<IParticipant>): void;
  reset(): void;
  setCards(cards: Array<ICard>): void;
  showError(errorCode: EErrorCode): void
  showInfo(errorCode: EErrorCode): void;
  showWarning(errorCode: EErrorCode): void;
  updateGameStatus(gameStatus: EGameStatus): void;
  updateTeamName(teamName: string): void;
  //#endregion
}
