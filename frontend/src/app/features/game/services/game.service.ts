import { computed, effect, inject, Service, Signal, signal, WritableSignal } from '@angular/core';
import { ICard, IParticipant } from 'shared-lib';
import { Member, MessageDispatcherService, SessionService } from '../../../core';
import { TeamService } from '../../team/services';

@Service()
export class GameService {
  //#region Private Fields ----------------------------------------------------
  private readonly _cards: WritableSignal<Array<ICard> | null>;
  //#endregion

  //#region Signals -----------------------------------------------------------
  public allMembers: Signal<Array<Member>>;
  //#endregion

  //#region Getters-Setters ---------------------------------------------------
  public get cards(): Signal<Array<ICard> | null> {
    return this._cards;
  }
  //#endregion

  //#region Constructor & C° -------------------------------------------------
  public constructor() {
    // Initialize service signals
    this._cards = signal<Array<ICard> | null>(null);
    // register message handlers
    const dispatcherSvc = inject(MessageDispatcherService);
    this.registerMessageHandlers(dispatcherSvc);
    // register service signals
    const sessionSvc = inject(SessionService);
    const teamSvc = inject(TeamService);
    this.allMembers = computed(() => {
      const me = sessionSvc.me();
      const others = teamSvc.members().map((p: IParticipant) => new Member(p, false));
      return me ? [me, ...others] : others;
    });
  }

  private registerMessageHandlers(dispatcherSvc: MessageDispatcherService): void {
    effect(() => {
      const cardSet = dispatcherSvc.cardSet();
      if (cardSet) {
        this._cards.set(cardSet.cards);
      } else {
        this._cards.set(null);
      }
    });
    effect(() => {
      if (dispatcherSvc.endSession()) {
        this.resetService();
      }
    });
    effect(() => {
      if (dispatcherSvc.serverReset()) {
        this.resetService();
      }
    });
    effect(() => {
      if (dispatcherSvc.teamIdle()) {
        this.resetService();
      }
    });
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private resetService(): void {
    this._cards.set(null);
  }
  //#endregion
}
