import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { extract } from '../../../../core';
import { TranslatePipe } from '@ngx-translate/core';

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

  //#region Getters-Setters ---------------------------------------------------
  // TODO once poker service is implemented work with signals
  public get disableReveal(): boolean {
    return true;
    // return this.pokerService.membersWithoutEstimation.length > 0;
  }

  public get showMe(): boolean {
    return true;
    // return this.sessionService.scrumMaster;
  }

  public get showReveal(): boolean {
    return true;
    // return this.pokerService.canPoker;
  }

  public get showStart(): boolean {
    return true;
    // return !this.pokerService.canPoker;
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public reveal(): void {
    // this.pokerService.reveal();
  }

  public start(): void {
    // this.pokerService.start();
  }

  public changeCardSet(): void {
    // this.cardService.changeCardSet();
  }
  //#endregion
}
