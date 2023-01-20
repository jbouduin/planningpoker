import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from '@shared';
import { DtoCard, DtoEstimation, DtoGame, DtoParticipant, ErrorCode, GameStatus, ParticipantStatus, Reason, Role } from '@shared-lib';
import { Card } from './card';
import { Estimation } from './estimation';
import { IGame } from './game.interface';
import { Participant } from './participant';

export class Game implements IGame {

  //#region Private readonly properties ---------------------------------------
  private readonly translateService: TranslateService;
  private readonly snackbarService: SnackbarService;
  private readonly estimationCollection: Map<string, Estimation>;
  private readonly localStorageNickKey: string = 'current_nick';
  private readonly localStorageUuidKey: string = 'current_uuid';
  private readonly localStorageTeamKey: string = 'current_team';
  private readonly participants: Map<string, Participant>;
  private readonly cardCollection: Map<number, Card>;
  //#endregion

  //#region Private properties ------------------------------------------------
  private gameStatus: GameStatus
  private name: string;
  private self?: Participant;
  //#endregion

  //#region Public Getters ----------------------------------------------------
  public get availableCards(): Array<Card> {
    return Array.from(this.cardCollection.values());
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
    return Array.from(this.estimationCollection.values());
  }

  public get developers(): Array<Participant> {
    const result = new Array<Participant>();
    if (this.self?.role === Role.Developer && this.self?.observer === false) {
      result.push(this.self);
    }
    for (const participant of this.participants.values()) {
      if (participant.role === Role.Developer && !participant.observer) {
        result.push(participant);
      }
    }
    return result;
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
    for (const participant of this.participants.values()) {
      if (participant.role === Role.Developer && participant.observer) {
        result.push(participant);
      }
    }
    return result;
  }

  public get scrumMaster(): Participant | undefined {
    if (this.self?.role === Role.ScrumMaster) {
      return this.self;
    }
    for (const participant of this.participants.values()) {
      if (participant.role === Role.ScrumMaster) {
        return participant;
      }
    }
    return undefined;
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
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    translateService: TranslateService,
    snackbarService: SnackbarService) {
    this.translateService = translateService;
    this.snackbarService = snackbarService;
    this.cardCollection = new Map<number, Card>();
    this.estimationCollection = new Map<string, Estimation>();
    this.participants = new Map<string, Participant>();
    this.name = localStorage.getItem(this.localStorageTeamKey) || '';
    this.gameStatus = localStorage.getItem(this.localStorageTeamKey) && localStorage.getItem(this.localStorageUuidKey) ?
      GameStatus.Disconnected : GameStatus.NoGame;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
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
          Array.from(this.cardCollection.values()),
          this.self);
        if (estimation) {
          this.estimationCollection.set(dtoEstimation.uuid, estimation);
          this.dumpEstimation(estimation);
        }
      } else {
        console.log(`Removing estimation '${dtoEstimation.uuid}'`);
        this.estimationCollection.delete(dtoEstimation.uuid);
      }
    });
  }

  public handleSelf(participant: DtoParticipant): void {
    this.self = Participant.createParticipant(participant, true);
    this.dumpSelf();
    localStorage.setItem(this.localStorageNickKey, this.self.nick);
    localStorage.setItem(this.localStorageUuidKey, this.self.uuid);
  }

  public handleSocketError(_error: any): void { // eslint-disable-line
    this.snackbarService.showError(
      this.translateService.instant('Game.Snackbar.CommunicationError')
    );
  }

  public handleParticipants(participants: Array<DtoParticipant>, reason: Reason): void {
    participants.forEach(dtoParticipant => {
      const participant: Participant = Participant.createParticipant(dtoParticipant, false);
      this.dumpParticipant(participant);
      if (participant.status === ParticipantStatus.Left) {
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$participant_has_left',
            { participant: participant.nick }
          )
        );
        this.participants.delete(participant.uuid);
      } else {
        if (reason !== Reason.Refresh && !this.participants.has(participant.uuid)) {
          this.snackbarService.showInfo(
            this.translateService.instant(
              'Game.Snackbar.$participant_has_joined',
              { participant: participant.nick }
            )
          );
        }
        this.participants.set(participant.uuid, participant);
      }
    });
  }

  public reset(): void {
    console.log('Resetting game');
    this.cardCollection.clear();
    this.estimationCollection.clear();
    this.participants.clear();
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
        this.cardCollection.set(card.index, card);
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
  //#endregion

  //#region Private methods ---------------------------------------------------
  private dumpCard(card: Card) {
    console.log({
      index: card.index,
      label: card.label
    });
  }

  // private dumpError(code: ErrorCode) {
  //   console.log({
  //     code: ErrorCode[code]
  //   });
  // }

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
  //#endregion
}
