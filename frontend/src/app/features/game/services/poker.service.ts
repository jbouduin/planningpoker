import { computed, effect, inject, Service, Signal, signal, WritableSignal } from '@angular/core';
import { CardDto, EGameState, EstimationDto, GameStateChangedDto } from 'shared-lib';
import { Member, MessageDispatcherService, SessionService, SocketService, UiEventsService } from '../../../core';
import { EstimateMessage, RevealMessage, StartMessage, WithdrawEstimationMessage } from '../messages';
import { Estimation } from './estimation';
import { GameService } from './game.service';

@Service()
export class PokerService {
  //#region private readonly fields -------------------------------------------
  private readonly sessionSvc: SessionService;
  private readonly socketSvc: SocketService;
  private readonly UiEventsService: UiEventsService;
  private readonly _gameState: WritableSignal<EGameState>;
  //#endregion

  //#region Private Signals ---------------------------------------------------
  private allMembers: Signal<Array<Member>>;
  private cards: Signal<Array<CardDto> | null>;
  private givenEstimations: WritableSignal<Map<string, EstimationDto>>;
  //#endregion

  //#region Public Signals ----------------------------------------------------
  public estimations: Signal<Array<Estimation>>;
  //#endregion

  //#region Getters: Signals --------------------------------------------------
  public get gameState(): Signal<EGameState> {
    return this._gameState;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Inject other services ---
    this.sessionSvc = inject(SessionService);
    this.socketSvc = inject(SocketService);
    this.UiEventsService = inject(UiEventsService);
    // --- Initialize service signals ---
    this._gameState = signal(EGameState.Cleared);
    // --- Initialize mirroring signals ---
    const gameSvc = inject(GameService);
    this.allMembers = gameSvc.allMembers;
    this.cards = gameSvc.cards;
    // --- initialize own signals ---
    this.givenEstimations = signal<Map<string, EstimationDto>>(new Map());
    this.estimations = computed(() => {
      return this.calculateEstimationList();
    });
    // --- register message handlers ---
    const dispatcherSvc = inject(MessageDispatcherService);
    this.registerMessageHandlers(dispatcherSvc);
  }

  private registerMessageHandlers(dispatcherSvc: MessageDispatcherService): void {
    effect(() => {
      if (dispatcherSvc.clearEstimations()) {
        this.givenEstimations.set(new Map());
      }
    });

    effect(() => {
      const estimations = dispatcherSvc.estimationList();

      if (estimations) {
        this.givenEstimations.update((oldMap: Map<string, EstimationDto>) => {
          const newMap = new Map(oldMap);
          estimations.forEach((e: EstimationDto) => {
            newMap.set(e.participantId, e);
          });
          return newMap;
        });
      }
    });

    effect(() => {
      if (dispatcherSvc.sessionEnded()) {
        this.resetService();
      }
    });

    effect(() => {
      this.handleGameState(dispatcherSvc.gameStateChanged());
    });

    effect(() => {
      const withdrawal = dispatcherSvc.estimationWithdrawn();
      if (withdrawal !== null) {
        this.givenEstimations.update((oldMap: Map<string, EstimationDto>) => {
          const newMap = new Map(oldMap);
          newMap.delete(withdrawal.participantId);
          return newMap;
        });
      }
    });
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public withDraw(): void {
    const me = this.sessionSvc.me();
    if (me != null) {
      const message = new WithdrawEstimationMessage(me.participantId);
      this.socketSvc.sendMessage(message);
    } else {
      this.UiEventsService.showError('App.Snackbar.Invalid_Session_State');
    }
  }

  public estimate(index: number): void {
    const me = this.sessionSvc.me();
    if (me != null) {
      const message = new EstimateMessage(me.participantId, index);
      this.socketSvc.sendMessage(message);
    } else {
      this.UiEventsService.showError('App.Snackbar.Invalid_Session_State');
    }
  }

  public reveal(): void {
    const me = this.sessionSvc.me();
    if (me != null) {
      const message = new RevealMessage(me.participantId);
      this.socketSvc.sendMessage(message);
    } else {
      this.UiEventsService.showError('App.Snackbar.Invalid_Session_State');
    }
  }

  public start(): void {
    const me = this.sessionSvc.me();
    if (me != null) {
      const message = new StartMessage(me.participantId);
      this.socketSvc.sendMessage(message);
    } else {
      this.UiEventsService.showError('App.Snackbar.Invalid_Session_State');
    }
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleGameState(data: GameStateChangedDto): void {
    this._gameState.set(data.state);
    switch (data.state) {
      case EGameState.Cleared:
        this.givenEstimations.update(() => new Map());
        break;
      case EGameState.Started:
        this.givenEstimations.update(() => new Map());
        break;
      // case EGameState.Revealed: → no additional action required
    }
  }

  private resetService(): void {
    this._gameState.set(EGameState.Cleared);
    this.givenEstimations.update(() => new Map());
  }

  private calculateEstimationList(): Array<Estimation> {
    const currentState = this._gameState();
    const members = this.allMembers();
    const cards = this.cards();
    const givenEstimations = this.givenEstimations();
    let result = new Array<Estimation>();
    if (cards != null && cards.length > 0 && members.length > 0 && currentState != EGameState.Cleared) {
      result = members
        .filter((member: Member) => !member.observer)
        .map((member: Member) => {
          const givenEstimation = givenEstimations.get(member.participantId) ?? null;
          const card = givenEstimation
            ? cards?.find((c: CardDto) => c.index === givenEstimation.cardIndex) || null
            : null;
          return new Estimation(member, card, givenEstimation !== null);
        });
      result = this.sortEstimations(currentState, result);
    }
    return result;
  }

  /**
   * Sort the estimations.
   *
   * - If `gameState == EGameState.Started` then:
   *   - put my estimation in front
   *   - followed by estimations that have a card, ordered by nickname
   *   - followed by estimations with no card, ordered by nickname
   * - If `gameState == EGame.Revelad` then order by card index, by nickname
   *
   * @param gameState
   * @param estimations
   */
  private sortEstimations(gameState: EGameState, estimations: Array<Estimation>): Array<Estimation> {
    let result = new Array<Estimation>();
    if (gameState === EGameState.Started) {
      const myEstimation = estimations.find((e: Estimation) => e.member.me);
      const estimationsWithValue = estimations
        .filter((e: Estimation) => e.card !== null && !e.member.me)
        .sort((a: Estimation, b: Estimation) => a.member.nick.localeCompare(b.member.nick));
      const estimationsWithoutValue = estimations.filter((e: Estimation) => e.card === null && !e.member.me);
      result = myEstimation
        ? [myEstimation, ...estimationsWithValue, ...estimationsWithoutValue]
        : [...estimationsWithValue, ...estimationsWithoutValue];
    } else {
      result = estimations.sort((a: Estimation, b: Estimation) => {
        let compared = (a.card?.index || 0) - (b.card?.index || 0);
        if (compared == 0) {
          compared = a.member.nick.localeCompare(b.member.nick);
        }
        return compared;
      });
    }
    return result;
  }
  //#endregion
}
