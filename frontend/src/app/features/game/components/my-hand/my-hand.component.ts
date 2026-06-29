import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CardDto, EGameState } from 'shared-lib';
import { CardComponent } from '../../../../shared/components';
import { IDisplayCard } from '../../../../shared/components/card/display-card';
import { GameService, PokerService } from '../../services';

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
  protected readonly displayCards: Signal<Array<IDisplayCard>>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(gameSvc: GameService, pokerSvc: PokerService) {
    this.gameSvc = gameSvc;
    this.pokerSvc = pokerSvc;
    this.canEstimate = computed(() => gameSvc.cards() != null && pokerSvc.gameState() == EGameState.Started);
    this.displayCards = computed(() => {
      let result = new Array<IDisplayCard>();
      const cards = gameSvc.cards();
      const gameState = pokerSvc.gameState();
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
