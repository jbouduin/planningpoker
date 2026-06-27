import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState } from 'shared-lib';
import { extract } from '../../../../core';
import { CardComponent } from '../../../../shared/components';
import { PokerService } from '../../services';
import { Estimation } from '../../services/estimation';

@Component({
  selector: 'app-playfield',
  imports: [CardComponent, CommonModule, MatCardModule, TranslatePipe],
  templateUrl: './playfield.component.html',
  styleUrl: './playfield.component.scss'
})
export class PlayfieldComponent {
  //#region Protected Fields --------------------------------------------------
  protected ME_LABEL = extract('Label.Generic.Me');
  protected readonly pokerSvc: PokerService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(pokerSvc: PokerService) {
    this.pokerSvc = pokerSvc;
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public cardClicked(): void {
    // BUG this.pokerSvc.withDraw(); does not work currently
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  protected isCardEnabled(estimation: Estimation): boolean {
    return this.pokerSvc.gameState() == EGameState.Started && estimation.member.me;
  }
  //#endregion
}
