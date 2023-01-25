import { Component, Input } from '@angular/core';
import { Team } from '@app/session/objects';

@Component({
  selector: 'session-team-header',
  templateUrl: './team-header.component.html',
  styleUrls: ['./team-header.component.scss']
})
export class TeamHeaderComponent {

  // TODO replace by team service
  @Input() team?: Team;

  //#region getters -----------------------------------------------------------
  public get teamName(): string {
    return this.team?.teamName || 'unknown';
  }
  //#endregion
}
