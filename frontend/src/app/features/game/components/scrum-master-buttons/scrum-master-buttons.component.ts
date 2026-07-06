import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState } from 'shared-lib';
import { extract } from '../../../../core';
import { PokerService } from '../../services';
import { Estimation } from '../../services/estimation';

@Component({
  selector: 'app-scrum-master-buttons',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './scrum-master-buttons.component.html',
  styleUrl: './scrum-master-buttons.component.scss'
})
export class ScrumMasterButtonsComponent {
  // FEATURE allow scrum master to clear estimations when status == revealed, without starting another round

  //#region Translation Keys --------------------------------------------------
  protected readonly CHANGE_CARDSET_LABEL = extract('Game.ScrumMasterButtons.Button.ChangeCardSet');
  protected readonly REVEAL_LABEL = extract('Game.ScrumMasterButtons.Button.Reveal');
  protected readonly FORCE_REVEAL_LABEL = extract('Game.ScrumMasterButtons.Button.ForceReveal');
  protected readonly START_LABEL = extract('Game.ScrumMasterButtons.Button.Start');
  //#endregion

  //#region Protected Fields --------------------------------------------------
  protected readonly pokerSvc: PokerService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly disableChangeCardSet: Signal<boolean>;
  protected readonly disableForceReveal: Signal<boolean>;
  protected readonly disableReveal: Signal<boolean>;
  protected readonly showReveal: Signal<boolean>;
  protected readonly showStart: Signal<boolean>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(pokerSvc: PokerService) {
    this.pokerSvc = pokerSvc;
    this.disableChangeCardSet = computed(() => {
      const gameState = this.pokerSvc.gameState();
      return gameState == EGameState.Started || gameState == EGameState.Revealed;
    });
    this.disableForceReveal = computed(() => {
      const estimations = this.pokerSvc.estimations();
      return estimations.findIndex((e: Estimation) => e.hasEstimated == false) == -1;
    });
    this.disableReveal = computed(() => {
      const estimations = this.pokerSvc.estimations();
      return estimations.findIndex((e: Estimation) => e.hasEstimated == false) >= 0;
    });
    this.showReveal = computed(() => {
      return this.pokerSvc.gameState() == EGameState.Started;
    });
    this.showStart = computed(() => {
      const gameState = this.pokerSvc.gameState();
      return gameState == EGameState.Cleared || gameState == EGameState.Revealed;
    });
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public reveal(): void {
    this.pokerSvc.reveal();
  }

  protected start(): void {
    this.pokerSvc.start();
  }

  public changeCardSet(): void {
    // this.cardService.changeCardSet();
  }
  //#endregion
}
