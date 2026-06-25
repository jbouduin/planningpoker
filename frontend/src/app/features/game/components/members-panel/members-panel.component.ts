import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { ERole } from 'shared-lib';
import { extract, Member, SessionService } from '../../../../core';
import { MessageBoxParams } from '../../../../shared';
import { DialogService } from '../../../../shared';
import { TeamService } from '../../../team';
import { GameService } from '../../services';
import { MemberComponent } from '../member/member.component';

@Component({
  selector: 'app-members-panel',
  imports: [CommonModule, MatCardModule, MemberComponent, TranslatePipe],
  templateUrl: './members-panel.component.html',
  styleUrl: './members-panel.component.scss'
})
export class MembersPanelComponent {
  //#region Private fields ----------------------------------------------------
  private readonly sessionSvc: SessionService;
  private readonly dialogSvc: DialogService;
  private readonly teamSvc: TeamService;
  //#endregion

  //#region Translation keys --------------------------------------------------
  protected readonly LEAVE_LABEL = extract('MemberButtons.Component.Button.Leave.Label');
  protected readonly PAUSE_LABEL = extract('MemberButtons.Component.Button.Pause.Label');
  protected readonly END_SESSION_LABEL = extract('ScrumMasterButtons.Component.Button.EndSession.Label');
  protected readonly SCRUM_MASTER_LABEL = extract('MemberPanel.Component.Header.ScrumMaster');
  protected readonly DEVELOPERS_LABEL = extract('MemberPanel.Component.Header.Developers');
  protected readonly OBSERVERS_LABEL = extract('MemberPanel.Component.Header.Observers');
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly scrumMaster: Signal<Member | null>;
  protected readonly developers: Signal<Array<Member>>;
  protected readonly observers: Signal<Array<Member>>;
  //#endregion

  //#region Getters -----------------------------------------------------------
  protected get canPause(): boolean {
    return false;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dialogSvc: DialogService, gameSvc: GameService, sessionSvc: SessionService, teamSvc: TeamService) {
    // inject other Services
    this.dialogSvc = dialogSvc;
    this.sessionSvc = sessionSvc;
    this.teamSvc = teamSvc;
    this.scrumMaster = computed(() => {
      return gameSvc.allMembers().find((m) => m.role == ERole.ScrumMaster) || null;
    });
    this.developers = computed(() => {
      return gameSvc
        .allMembers()
        .filter((m: Member) => !m.observer && m.role != ERole.ScrumMaster)
        .sort((a, b) => a.nick.localeCompare(b.nick));
    });
    this.observers = computed(() => {
      return gameSvc
        .allMembers()
        .filter((m: Member) => m.observer && m.role != ERole.ScrumMaster)
        .sort((a, b) => a.nick.localeCompare(b.nick));
    });
  }
  //#endregion

  //#region UI Triggers -------------------------------------------------------
  protected leave(): void {
    const params = new MessageBoxParams();
    params.cancelButtonLabelKey = extract('Button.Generic.Label.No');
    params.okButtonLabelKey = extract('Button.Generic.Label.Yes');
    params.titleKey = extract('MessageBox.Generic_confirmation.Text');

    params.textKey = this.scrumMaster()?.me
      ? extract('MessageBox.Do_you_want_to_dissolve_the_team.Text')
      : extract('MessageBox.Do_you_want_to_leave_the_team.Text');

    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.leaveSession();
      }
    });
  }

  protected pause(): void {
    // TODO implement pause
  }
  //#endregion
}
