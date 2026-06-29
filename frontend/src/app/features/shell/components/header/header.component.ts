import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState } from 'shared-lib';
import { extract } from '../../../../core';
import { versionInfo } from '../../../../core/services/version-info';
import { PokerService } from '../../../game';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslatePipe, LanguageSelectorComponent, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  //#region Translation keys --------------------------------------------------
  protected readonly ROUTE_LABEL_HOME = extract('Navigation.RouteLabel.Home');
  protected readonly ROUTE_LABEL_PRIVACY = extract('Navigation.RouteLabel.Privacy');
  protected readonly ROUTE_LABEL_LEGAL = extract('Navigation.RouteLabel.Legal');
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected canNavigate: Signal<boolean>;
  //#endregion

  //#region Getters -----------------------------------------------------------
  public get version(): string {
    return `Planning-poker v${versionInfo.version}`;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(pokerSvc: PokerService) {
    this.canNavigate = computed(() => {
      return pokerSvc.gameState() != EGameState.Started;
    });
  }
  //#endregion
}
