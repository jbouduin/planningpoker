import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from '@shared';
import { ICard, IEstimation, IParticipant, EErrorCode, EGameStatus, EParticipantStatus, ERole } from '@shared-lib';
import { Card } from './card';
import { Estimation } from './estimation';
import { IGame } from './game.interface';
import { Member } from './member';

export class Game implements IGame {

  //#region Private readonly properties ---------------------------------------
  private readonly translateService: TranslateService;
  private readonly snackbarService: SnackbarService;
  private readonly estimationCollection: Map<string, Estimation>;
  private readonly localStorageNickKey: string = 'current_nick';
  private readonly localStorageUuidKey: string = 'current_uuid';
  private readonly localStorageTeamKey: string = 'current_team';
  private readonly participants: Map<string, Member>;
  private readonly cardCollection: Map<number, Card>;
  //#endregion

  //#region Private properties ------------------------------------------------
  private gameStatus: EGameStatus
  private name: string;
  private self?: Member;
  //#endregion

  //#region Public Getters ----------------------------------------------------
  public get availableCards(): Array<Card> {
    return Array.from(this.cardCollection.values());
  }

  public get canEstimate(): boolean {
    return this.gameStatus === EGameStatus.Started && !this.self?.observer;
  }

  public get canReconnect(): boolean {
    return this.status === EGameStatus.Disconnected;
  }

  public get enabled(): boolean {
    return this.gameStatus !== EGameStatus.Disconnected;
  }

  public get estimations(): Array<Estimation> {
    return Array.from(this.estimationCollection.values());
  }

  public get developers(): Array<Member> {
    const result = new Array<Member>();
    if (this.self?.role === ERole.Developer && this.self?.observer === false) {
      result.push(this.self);
    }
    for (const participant of this.participants.values()) {
      if (participant.role === ERole.Developer && !participant.observer) {
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

  public get myRole(): ERole {
    return this.self ? this.self.role : ERole.Unknown;
  }

  public get myUuid(): string {
    return this.self ?
      this.self.uuid :
      localStorage.getItem(this.localStorageUuidKey) || '';
  }

  public get observers(): Array<Member> {
    const result = new Array<Member>();
    if (this.self?.role === ERole.Developer && this.self?.observer === true) {
      result.push(this.self);
    }
    for (const participant of this.participants.values()) {
      if (participant.role === ERole.Developer && participant.observer) {
        result.push(participant);
      }
    }
    return result;
  }

  public get scrumMaster(): Member | undefined {
    if (this.self?.role === ERole.ScrumMaster) {
      return this.self;
    }
    for (const participant of this.participants.values()) {
      if (participant.role === ERole.ScrumMaster) {
        return participant;
      }
    }
    return undefined;
  }

  public get showReveal(): boolean {
    return this.gameStatus === EGameStatus.Started &&
      this.myRole === ERole.ScrumMaster &&
      this.estimations.length === this.developers.length + 1;
  }

  public get showStart(): boolean {
    return (this.gameStatus === EGameStatus.Revealed || this.gameStatus === EGameStatus.Stopped) &&
      this.myRole === ERole.ScrumMaster;
  }

  public get status(): EGameStatus {
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
    this.participants = new Map<string, Member>();
    this.name = localStorage.getItem(this.localStorageTeamKey) || '';
    this.gameStatus = localStorage.getItem(this.localStorageTeamKey) && localStorage.getItem(this.localStorageUuidKey) ?
      EGameStatus.Disconnected : EGameStatus.NoGame;
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
    this.gameStatus = EGameStatus.Disconnected;
  }

  public handleErrorMessage(code: EErrorCode): boolean {
    this.showError(code);
    const result =
      code === EErrorCode.TeamAlreadyExists ||
      code === EErrorCode.TeamDoesNotExist ||
      code === EErrorCode.ParticipantNotFound;
    return result;
  }

  public handleEstimations(dtoEstimations: Array<IEstimation>): void {
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

  public handleSelf(participant: IParticipant): void {
    this.self = new Member(participant, true);
    this.dumpSelf();
    localStorage.setItem(this.localStorageNickKey, this.self.nick);
    localStorage.setItem(this.localStorageUuidKey, this.self.uuid);
  }

  public handleSocketError(_error: any): void { // eslint-disable-line
    this.snackbarService.showError(
      this.translateService.instant('Game.Snackbar.CommunicationError')
    );
  }

  public handleMemberList(memberList: Array<IParticipant>, showJoins: boolean): void {
    memberList.forEach(dtoParticipant => {
      const participant: Member = new Member(dtoParticipant, false);
      this.dumpParticipant(participant);
      if (participant.status === EParticipantStatus.Left) {
        this.snackbarService.showInfo(
          this.translateService.instant(
            'Game.Snackbar.$participant_has_left',
            { participant: participant.nick }
          )
        );
        this.participants.delete(participant.uuid);
      } else {
        if (showJoins && !this.participants.has(participant.uuid)) {
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
    this.gameStatus = EGameStatus.NoGame;
    this.name = '';
    this.self = undefined;
    localStorage.removeItem(this.localStorageNickKey);
    localStorage.removeItem(this.localStorageUuidKey);
    localStorage.removeItem(this.localStorageTeamKey);
  }

  public setCards(cards: Array<ICard>): void {
    cards
      .map(card => Card.createCard(card))
      .forEach(card => {
        this.dumpCard(card);
        this.cardCollection.set(card.index, card);
      });
  }

  public showError(errorCode: EErrorCode): void {
    this.snackbarService.showError(
      this.translateService.instant(`ErrorCode.${EErrorCode[errorCode]}`)
    );
  }

  public showInfo(errorCode: EErrorCode): void {
    this.snackbarService.showInfo(
      this.translateService.instant(`ErrorCode.${EErrorCode[errorCode]}`)
    );
  }

  public showWarning(errorCode: EErrorCode): void {
    this.snackbarService.showWarning(
      this.translateService.instant(`ErrorCode.${EErrorCode[errorCode]}`)
    );
  }

  public updateGameStatus(gameStatus: EGameStatus): void {
    this.gameStatus = gameStatus;
    this.dumpGame();
  }

  public updateTeamName(teamName: string): void {
    this.name = teamName;
    this.dumpGame();
    localStorage.setItem(this.localStorageTeamKey, teamName);
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
      participant: estimation.member,
      revealed: estimation.revealed
    });
  }

  private dumpGame(): void {
    console.log({
      team: this.team,
      status: EGameStatus[this.status]
    });
  }

  private dumpParticipant(participant: Member): void {
    console.log({
      status: EParticipantStatus[participant.status],
      nick: participant.nick,
      uuid: participant.uuid,
      observer: participant.observer,
      role: ERole[participant.role]
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
