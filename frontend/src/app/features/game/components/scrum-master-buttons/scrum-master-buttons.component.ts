import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { extract } from '../../../../core';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState } from 'shared-lib';
import { PokerService } from '../../services';
import { Estimation } from '../../services/estimation';

@Component({
  selector: 'app-scrum-master-buttons',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './scrum-master-buttons.component.html',
  styleUrl: './scrum-master-buttons.component.scss'
})
export class ScrumMasterButtonsComponent {
  //#region Translation Keys --------------------------------------------------
  protected readonly CHANGE_CARDSET_LABEL = extract('ScrumMasterButtons.Component.Button.ChangeCardSet.Label');
  protected readonly REVEAL_LABEL = extract('ScrumMasterButtons.Component.Button.Reveal.Label');
  protected readonly FORCE_REVEAL_LABEL = extract('ScrumMasterButtons.Component.Button.ForceReveal.Label');
  protected readonly START_LABEL = extract('ScrumMasterButtons.Component.Button.Start.Label');
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
    this.disableChangeCardSet = this.showReveal = computed(() => {
      return this.pokerSvc.pokerState() != EGameState.Cleared;
    });
    this.disableForceReveal = computed(() => {
      const estimations = this.pokerSvc.estimations();
      return estimations.find((e: Estimation) => e.card == null) == undefined;
    });
    this.disableReveal = computed(() => {
      const estimations = this.pokerSvc.estimations();
      return estimations.find((e: Estimation) => e.card == null) != undefined;
    });
    this.showReveal = computed(() => {
      return this.pokerSvc.pokerState() == EGameState.Started;
    });
    this.showStart = computed(() => {
      const pokerState = this.pokerSvc.pokerState();
      return pokerState == EGameState.Cleared || pokerState == EGameState.Revealed;
    });
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public reveal(): void {
    this.pokerSvc.reveal();
  }

  public start(): void {
    this.pokerSvc.start();
  }

  public changeCardSet(): void {
    // this.cardService.changeCardSet();
  }
  //#endregion
}
