import { computed, inject, Service, Signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CardDto, CardSetDto, ECardSetType } from 'shared-lib';
import { ChangeCardSetMessage } from '../../features/game/messages';
import { ApiService } from './api.service';
import { CardSetSelectItem } from './card-set-select-item';
import { MessageDispatcherService } from './message-dispatcher.service';
import { SessionService } from './session.service';

@Service()
export class CardSetService {
  //#region Private Fields ----------------------------------------------------
  private readonly apiService: ApiService;
  private readonly sessionSvc: SessionService;
  private _allCardSets: Array<CardSetDto>;
  //#endregion

  //#region Signals -----------------------------------------------------------
  public currentCardSet: Signal<CardSetDto>;
  //#endregion

  //#region Getters -----------------------------------------------------------
  public get allCardSets(): Array<CardSetDto> {
    return this._allCardSets;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency injetion ---
    this.apiService = inject(ApiService);
    // --- Dependency injection ---
    this.sessionSvc = inject(SessionService);

    const messageDispatcher = inject(MessageDispatcherService);

    // --- Initialize ---
    this.currentCardSet = computed(() => {
      const cardSet = messageDispatcher.cardSet();
      if (cardSet) {
        return cardSet;
      } else {
        return { cards: new Array<CardDto>(), cardSet: ECardSetType.Cohn };
      }
    });
    this._allCardSets = new Array<CardSetDto>();
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public changeCardSet(cardSet: CardSetDto): void {
    this.sessionSvc.sendMessage(ChangeCardSetMessage, cardSet);
  }

  public init(): Observable<Array<CardSetDto>> {
    return this.apiService.getAllCardSets().pipe(tap((result: Array<CardSetDto>) => (this._allCardSets = result)));
  }

  public getCardSetSelectItems(includeCustom: boolean): Array<CardSetSelectItem> {
    const sets = this._allCardSets.map((c: CardSetDto) => c.cardSet);
    if (includeCustom) {
      sets.push(ECardSetType.Custom);
    }

    return sets.map((set: ECardSetType) => {
      return {
        set: set,
        label: `Enum.ECardSetType.${set}`
      };
    });
  }
  //#endregion
}
