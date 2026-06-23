import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { ERole, IParticipant } from 'shared-lib';
import { extract, Member, SessionService } from '../../../core';
import { TeamService } from '../../team/services/team.service';
import { MemberComponent } from './member.component';

@Component({
  selector: 'app-members-panel',
  imports: [CommonModule, MatCardModule, MemberComponent, TranslatePipe],
  templateUrl: './members-panel.component.html',
  styleUrl: './members-panel.component.scss'
})
export class MembersPanelComponent {
  //#region Private fields ----------------------------------------------------
  private sessionSvc: SessionService;
  private teamSvc: TeamService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected scrumMaster: Signal<Member | null>;
  protected developers: Signal<Array<Member>>;
  protected observers: Signal<Array<Member>>;
  //#endregion

  //#region Translation keys --------------------------------------------------
  protected readonly SCRUM_MASTER_LABEL = extract('MemberPanel.Component.Header.ScrumMaster');
  protected readonly DEVELOPERS_LABEL = extract('MemberPanel.Component.Header.Developers');
  protected readonly OBSERVERS_LABEL = extract('MemberPanel.Component.Header.Observers');
  //#endregion

  //#region Getters -----------------------------------------------------------
  protected get canPause(): boolean {
    return false;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(sessionSvc: SessionService, teamSvc: TeamService) {
    this.sessionSvc = sessionSvc;
    this.teamSvc = teamSvc;
    this.scrumMaster = computed(() => {
      return this.getAllMembers().find((m) => m.role == ERole.ScrumMaster) || null;
    });
    this.developers = computed(() => {
      return this.getAllMembers()
        .filter((m: Member) => !m.observer && m.role != ERole.ScrumMaster)
        .sort((a, b) => a.nick.localeCompare(b.nick));
    });
    this.observers = computed(() => {
      return this.getAllMembers()
        .filter((m: Member) => m.observer && m.role != ERole.ScrumMaster)
        .sort((a, b) => a.nick.localeCompare(b.nick));
    });
  }
  //#endregion

  //#region UI Triggers -------------------------------------------------------
  protected leave(): void {
    // TODO if scrum master → ask
    this.sessionSvc.leaveSession();
  }

  protected pause(): void {
    // TODO
  }
  //#endregion

  //#region Auxiliary methods -------------------------------------------------
  private getAllMembers(): Array<Member> {
    const me = this.sessionSvc.me();
    const others = this.teamSvc.members().map((p: IParticipant) => new Member(p, false));
    return me ? [me, ...others] : others;
  }
  //#region
}
