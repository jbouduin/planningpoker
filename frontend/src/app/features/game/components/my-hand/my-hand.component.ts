import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CardDto, EGameState } from 'shared-lib';
import { CardSetService } from '../../../../core';
import { CardComponent } from '../../../../shared/components';
import { IDisplayCard } from '../../../../shared/components/card/display-card';
import { PokerService } from '../../services';

@Component({
  selector: 'app-my-hand',
  imports: [CardComponent, CommonModule, MatCardModule],
  templateUrl: './my-hand.component.html',
  styleUrl: './my-hand.component.scss'
})
export class MyHandComponent {
  //#region Private Fields ----------------------------------------------------
  protected readonly pokerSvc: PokerService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly canEstimate: Signal<boolean>;
  protected readonly displayCards: Signal<Array<IDisplayCard>>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency injections ---
    this.pokerSvc = inject(PokerService);
    const cardSetSvc = inject(CardSetService);
    // --- Initialize ---
    this.canEstimate = computed(() => this.pokerSvc.gameState() == EGameState.Started);
    this.displayCards = computed(() => {
      let result = new Array<IDisplayCard>();
      const cards = cardSetSvc.currentCardSet().cards;
      const gameState = this.pokerSvc.gameState();
      if (cards !== null && cards.length > 0) {
        result = cards.map((c: CardDto) => {
          const displayCard: IDisplayCard = {
            isAvailable: true,
            card: c,
            enabled: gameState == EGameState.Started,
            intent: 'none',
            member: null
          };
          return displayCard;
        });
      }
      return result;
    });
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public cardClicked(index: number): void {
    this.pokerSvc.estimate(index);
  }
  //#endregion
}
