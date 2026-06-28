import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState } from 'shared-lib';
import { extract } from '../../../../core';
import { CardComponent } from '../../../../shared/components';
import { IDisplayCard } from '../../../../shared/components/card/display-card';
import { PokerService } from '../../services';
import { Estimation } from '../../services/estimation';

@Component({
  selector: 'app-playfield',
  imports: [CardComponent, CommonModule, MatCardModule, TranslatePipe],
  templateUrl: './playfield.component.html',
  styleUrl: './playfield.component.scss'
})
export class PlayfieldComponent {
  protected readonly displayCards: Signal<Array<IDisplayCard>>;

  //#region Protected Fields --------------------------------------------------
  protected ME_LABEL = extract('Label.Generic.Me');
  protected readonly pokerSvc: PokerService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(pokerSvc: PokerService) {
    this.displayCards = computed(() => {
      const estimations = pokerSvc.estimations();
      const gameState = pokerSvc.gameState();
      return estimations.map((e: Estimation) => {
        const displayCard: IDisplayCard = {
          isAvailable: e.hasEstimated,
          member: e.member,
          card: e.card,
          enabled: e.member.me && gameState == EGameState.Started,
          intent: e.member.me ? 'primary' : 'none'
        };
        return displayCard;
      });
    });
    this.pokerSvc = pokerSvc;
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public cardClicked(): void {
    this.pokerSvc.withDraw();
  }
  //#endregion
}
