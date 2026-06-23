import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { GameService } from '../../services';
import { CardComponent } from '../../../../shared/components';

@Component({
  selector: 'app-my-hand',
  imports: [CardComponent, CommonModule, MatCardModule],
  templateUrl: './my-hand.component.html',
  styleUrl: './my-hand.component.scss'
})
export class MyHandComponent {
  //#region Protected Fields --------------------------------------------------
  protected readonly gameSvc: GameService;
  //#endregion

  //#region Getters-Setters ---------------------------------------------------
  protected get canEstimate(): boolean {
    // TODO return this.pokerService.canPoker && this.teamService.canPoker;
    return true;
  }
  //#region Constructor & C° --------------------------------------------------
  public constructor(gameSvc: GameService) {
    this.gameSvc = gameSvc;
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public cardClicked(_index: number): void {
    // TODO this.pokerService.estimate(index);
  }
  //#endregion
}
