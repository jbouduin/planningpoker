import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardSetDto, EGameState } from 'shared-lib';
import { CardSetService, extract } from '../../../../core';
import { CardSetDialogComponent, CardSetDialogComponentParams, DialogService } from '../../../../shared';
import { PokerService } from '../../services';
import { Estimation } from '../../services/estimation';
import { ScrumMasterButtonsComponentState } from './scrum-master-buttons.component.state';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-scrum-master-buttons',
  imports: [CommonModule, MatButtonModule, TranslatePipe],
  templateUrl: './scrum-master-buttons.component.html',
  styleUrl: './scrum-master-buttons.component.scss'
})
export class ScrumMasterButtonsComponent {
  // FEATURE allow scrum master to clear estimations when status == revealed, without starting another round

  //#region Protected Fields --------------------------------------------------
  private readonly cardSetSvc: CardSetService;
  private readonly dialogSvc: DialogService;
  private readonly pokerSvc: PokerService;
  //#endregion

  //#region Translation Keys --------------------------------------------------
  protected readonly CHANGE_CARDSET_LABEL = extract('Game.ScrumMasterButtons.Button.ChangeCardSet');
  protected readonly REVEAL_LABEL = extract('Game.ScrumMasterButtons.Button.Reveal');
  protected readonly FORCE_REVEAL_LABEL = extract('Game.ScrumMasterButtons.Button.ForceReveal');
  protected readonly START_LABEL = extract('Game.ScrumMasterButtons.Button.Start');
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly componentState: Signal<ScrumMasterButtonsComponentState>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency injection ---
    this.cardSetSvc = inject(CardSetService);
    this.dialogSvc = inject(DialogService);
    this.pokerSvc = inject(PokerService);

    // --- Initialize ---
    this.componentState = computed(() => {
      const gameState = this.pokerSvc.gameState();
      const estimations = this.pokerSvc.estimations();
      return {
        disableChangeCardSet: gameState == EGameState.Started || gameState == EGameState.Revealed,
        disableForceReveal: estimations.findIndex((e: Estimation) => e.hasEstimated == false) == -1,
        disableReveal: estimations.findIndex((e: Estimation) => e.hasEstimated == false) >= 0,
        showReveal: this.pokerSvc.gameState() == EGameState.Started,
        showStart: gameState == EGameState.Cleared || gameState == EGameState.Revealed
      };
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
    const params: CardSetDialogComponentParams = {
      currentCardSet: this.cardSetSvc.currentCardSet()
    };
    this.dialogSvc
      .openDialog<CardSetDialogComponent, CardSetDialogComponentParams, CardSetDto | null>(CardSetDialogComponent, {
        width: '600px',
        data: params
      })
      .subscribe((result: CardSetDto | null) => {
        if (result !== null) {
          this.cardSetSvc.changeCardSet(result);
        }
      });
  }
  //#endregion
}
