import { Component, Input } from '@angular/core';
import { Member, Team } from '@app/session/objects';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'session-member-panel',
  templateUrl: './member-panel.component.html',
  styleUrls: ['./member-panel.component.scss']
})
export class MemberPanelComponent {

  // TODO replace by a teamservice
  @Input() public team?: Team;

  //#region Private Properties ------------------------------------------------
  private translateService: TranslateService;
  //#endregion

  //#region Label Getters -----------------------------------------------------
  public get developersHeader(): string {
    return this.translateService.instant('Game.Component.Header.Developers');
  }

  public get observersHeader(): string {
    return this.translateService.instant('Game.Component.Header.Observers');
  }

  public get scrumMasterHeader(): string {
    return this.translateService.instant('Game.Component.Header.ScrumMaster');
  }
  //#endregion

  //#region Member getters ----------------------------------------------------
  public get observers(): Array<Member> {
    return this.team ? this.team.observers : new Array<Member>();
  }

  public get developers(): Array<Member> {
    return this.team ? this.team.developers : new Array<Member>();
  }

  public get scrumMaster(): Member | undefined {
    return this.team?.scrumMaster;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    translateService: TranslateService) {
    this.translateService = translateService;
  }
  //#endregion
}
