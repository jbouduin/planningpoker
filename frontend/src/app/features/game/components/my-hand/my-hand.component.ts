import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { GameService, PokerService } from '../../services';
import { CardComponent } from '../../../../shared/components';
import { EPokerStatus, ICard } from 'shared-lib';

@Component({
  selector: 'app-my-hand',
  imports: [CardComponent, CommonModule, MatCardModule],
  templateUrl: './my-hand.component.html',
  styleUrl: './my-hand.component.scss'
})
export class MyHandComponent {
  //#region Protected Fields --------------------------------------------------
  protected readonly gameSvc: GameService;
  protected readonly pokerSvc: PokerService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly canEstimate: Signal<boolean>;
  protected readonly cards: Signal<Array<ICard>>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(gameSvc: GameService, pokerSvc: PokerService) {
    this.gameSvc = gameSvc;
    this.pokerSvc = pokerSvc;
    this.cards = computed(() => {
      const cardSet = gameSvc.cardSet();
      return cardSet != null ? cardSet.cards : new Array<ICard>();
    });
    this.canEstimate = computed(() => gameSvc.cardSet() != null && pokerSvc.pokerState() == EPokerStatus.Started);
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public cardClicked(index: number): void {
    this.pokerSvc.estimate(index);
  }
  //#endregion
}
