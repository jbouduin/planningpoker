import { TranslateService } from '@ngx-translate/core';
import * as Collections from 'typescript-collections';

import { DtoCard, DtoEstimation, DtoGame, DtoParticipant } from '@shared-lib';
import { ErrorCode, GameStatus, ParticipantStatus, Reason, Role } from '@shared-lib';

import { SnackbarService } from '@shared';

import { Card } from './card';
import { Estimation } from './estimation';
import { Participant } from './participant';
import { IGame } from './game.interface';

export class Game implements IGame {

  // <editor-fold desc='Private readonly properties'>
  private readonly estimationCollection: Collections.Dictionary<string, Estimation>;
  private readonly localStorageNickKey: string = 'current_nick';
  private readonly localStorageUuidKey: string = 'current_uuid';
  private readonly localStorageTeamKey: string = 'current_team';
  private readonly participants: Collections.Dictionary<string, Participant>;
  private readonly cardCollection: Collections.Dictionary<number, Card>;
  // </editor-fold>

  // <editor-fold desc='Private properties'>
  private gameStatus: GameStatus
  private name: string;
  private self?: Participant;
  // </editor-fold>

  // <editor-fold desc='Public getter methods '>
  public get availableCards(): Array<Card> {
    return this.cardCollection.values();
  }

  public get canEstimate(): boolean {
    return this.gameStatus === GameStatus.Started && !this.self?.observer;
  }

  public get canReconnect(): boolean {
      return this.status === GameStatus.Disconnected;
  }

  public get enabled(): boolean {
    return this.gameStatus !== GameStatus.Disconnected;
  }

  public get estimations(): Array<Estimation> {
    return this.estimationCollection.values();
  }

  public get developers(): Array<Participant> {
    const result = new Array<Participant>();
    if (this.self?.role === Role.Developer && this.self?.observer === false) {
      result.push(this.self);
    }
    return result.concat(
      this.participants
        .values()
        .filter(participant => participant.role === Role.Developer && !participant.observer)
    );
  }

  public get myNick(): string {
    return this.self ?
      this.self.nick :
      localStorage.getItem(this.localStorageNickKey) || '';
  }

  public get myRole(): Role {
    return this.self ? this.self.role : Role.Unknown;
  }

  public get myUuid(): string {
    return this.self ?
      this.self.uuid :
      localStorage.getItem(this.localStorageUuidKey) || '';
  }

  public get observers(): Array<Participant> {
    const result = new Array<Participant>();
    if (this.self?.role === Role.Developer && this.self?.observer === true) {
      result.push(this.self);
    }
    return result.concat(
      this.participants
        .values()
        .filter(participant => participant.role === Role.Developer && participant.observer)
    );
  }

  public get scrumMaster(): Participant | undefined {
    if (this.self?.role === Role.ScrumMaster) {
      return this.self;
    }
    const result = this.participants.values()
      .filter(participant => participant.role === Role.ScrumMaster)[0];
    return result ? result : undefined;
  }

  public get showReveal(): boolean {
    return this.gameStatus === GameStatus.Started &&
      this.myRole === Role.ScrumMaster &&
      this.estimations.length === this.developers.length + 1;
  }

  public get showStart(): boolean {
    return (this.gameStatus === GameStatus.Revealed || this.gameStatus === GameStatus.Stopped) &&
      this.myRole === Role.ScrumMaster;
  }

  public get status(): GameStatus {
    return this.gameStatus;
  }

  public get team(): string {
    return this.name;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private readonly translateService: TranslateService,
    private readonly snackbarService: SnackbarService) {
    this.cardCollection = new Collections.Dictionary<number, Card>();
    this.estimationCollection = new Collections.Dictionary<string, Estimation>();
    this.participants = new Collections.Dictionary<string, Participant>();
    this.name = localStorage.getItem(this.localStorageTeamKey) || '';
    this.gameStatus = localStorage.getItem(this.localStorageTeamKey) && localStorage.getItem(this.localStorageUuidKey) ?
        GameStatus.Disconnected : GameStatus.NoGame
  }
  // </editor-fold>//

  // <editor-fold desc='Public methods'>
  public clearEstimations(): void {
    console.log('Clearing estimations');
    this.estimationCollection.clear();
  }

  public handleDisconnect(): void {
    this.snackbarService.showError(
      this.translateService.instant('Game.Snackbar.Disconnected')
    );
    this.gameStatus = GameStatus.Disconnected;
  }

  public handleErrorMessage(code: ErrorCode): boolean {
    this.showError(code);
    const result =
      code === ErrorCode.TeamAlreadyExists ||
      code === ErrorCode.TeamDoesNotExist ||
      code === ErrorCode.ParticipantNotFound;
    return result;
  }

  public handleEstimations(dtoEstimations: Array<DtoEstimation>): void {
    dtoEstimations.forEach(dtoEstimation => {
      if (dtoEstimation.card >= 0) {
        const estimation = Estimation.createEstimation(
          dtoEstimation,
          this.participants,
          this.cardCollection.values(),
          this.self);
        if (estimation) {
          this.estimationCollection.setValue(dtoEstimation.uuid, estimation);
          this.dumpEstimation(estimation);
        }
      } else {
        console.log(`Removing estimation '${dtoEstimation.uuid}'`);
        this.estimationCollection.remove(dtoEstimation.uuid);
      }
    });
  }

  public handleSelf(participant: DtoParticipant): void {
    this.self = Participant.createParticipant(participant, true);
    this.dumpSelf();
    localStorage.setItem(this.localStorageNickKey, this.self.nick);
    localStorage.setItem(this.localStorageUuidKey, this.self.uuid);
  }

  public handleSocketError(error: any): void {
    this.snackbarService.showError(
      this.translateService.instant('Game.Snackbar.CommunicationError')
    );
  }

  public handleParticipants(participants: Array<DtoParticipant>, reason: Reason): void {
    participants.forEach( dtoParticipant => {
      const participant: Participant = Participant.createParticipant(dtoParticipant, false);
      this.dumpParticipant(participant);
      if (participant.status === ParticipantStatus.Left)
      {
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$participant_has_left',
            { participant: participant.nick }
          )
        );
        this.participants.remove(participant.uuid);
      } else {
        if (reason !== Reason.Refresh && !this.participants.containsKey(participant.uuid)) {
          this.snackbarService.showInfo(
            this.translateService.instant(
              'Game.Snackbar.$participant_has_joined',
              { participant: participant.nick }
            )
          );
        }
        this.participants.setValue(participant.uuid, participant);
      }
    });
  }

  public reset(): void {
    console.log('Resetting game');
    this.cardCollection.clear();
    this.estimationCollection.clear();
    this.gameStatus = GameStatus.NoGame;
    this.name = '';
    this.self = undefined;
    localStorage.removeItem(this.localStorageNickKey);
    localStorage.removeItem(this.localStorageUuidKey);
    localStorage.removeItem(this.localStorageTeamKey);
  }

  public setCards(cards: Array<DtoCard>): void {
    cards
      .map(card => Card.createCard(card))
      .forEach(card => {
        this.dumpCard(card);
        this.cardCollection.setValue(card.index, card);
      });
  }

  public showError(errorCode: ErrorCode): void {
    this.snackbarService.showError(
      this.translateService.instant(`ErrorCode.${ErrorCode[errorCode]}`)
    );
  }

  public showInfo(errorCode: ErrorCode): void {
    this.snackbarService.showInfo(
      this.translateService.instant(`ErrorCode.${ErrorCode[errorCode]}`)
    );
  }

  public showWarning(errorCode: ErrorCode): void {
    this.snackbarService.showWarning(
      this.translateService.instant(`ErrorCode.${ErrorCode[errorCode]}`)
    );
  }

  public update(dtoGame: DtoGame): void {
    this.gameStatus = dtoGame.status;
    this.name = dtoGame.team;
    this.dumpGame();
    localStorage.setItem(this.localStorageTeamKey, dtoGame.team);
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private dumpCard(card: Card) {
    console.log({
      index: card.index,
      label: card.label
    });
  }

  private dumpError(code: ErrorCode) {
    console.log({
      code: ErrorCode[code]
    });
  }

  private dumpEstimation(estimation: Estimation): void {
    console.log({
      card: estimation.card,
      participant: estimation.participant,
      revealed: estimation.revealed
    });
  }

  private dumpGame(): void {
    console.log({
      team: this.team,
      status: GameStatus[this.status]
    });
  }

  private dumpParticipant(participant: Participant): void {
    console.log({
      status: ParticipantStatus[participant.status],
      nick: participant.nick,
      uuid: participant.uuid,
      observer: participant.observer,
      role: Role[participant.role]
    });
  }

  private dumpSelf(): void {
    if (this.self) {
      this.dumpParticipant(this.self);
    } else {
      console.log('Self is not set yet');
    }
  }
  // </editor-fold>
}
