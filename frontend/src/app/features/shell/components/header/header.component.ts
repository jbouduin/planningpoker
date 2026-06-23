import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { extract } from '../../../../core';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { RouterModule } from '@angular/router';

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

  //#region Getters -----------------------------------------------------------
  public get version(): string {
    // TODO return `Planning-poker v${versionInfo.version}`;
    return 'Planning-poker vx.y.z';
  }

  public get canNavigate(): boolean {
    // TODO
    return true;
  }
  //#endregion
}
