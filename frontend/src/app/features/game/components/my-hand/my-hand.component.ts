import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { EGameState } from 'shared-lib';
import { CardComponent } from '../../../../shared/components';
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
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(gameSvc: GameService, pokerSvc: PokerService) {
    this.gameSvc = gameSvc;
    this.pokerSvc = pokerSvc;
    this.canEstimate = computed(() => gameSvc.cards() != null && pokerSvc.gameState() == EGameState.Started);
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public cardClicked(index: number): void {
    this.pokerSvc.estimate(index);
  }
  //#endregion
}
