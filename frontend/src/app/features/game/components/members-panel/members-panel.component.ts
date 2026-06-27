import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState, ERole } from 'shared-lib';
import { extract, Member, SessionService } from '../../../../core';
import { DialogService, MessageBoxParams } from '../../../../shared';
import { GameService, PokerService } from '../../services';
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
  // private readonly teamSvc: TeamService;
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
  protected readonly canLeave: Signal<boolean>;
  protected readonly canPause: Signal<boolean>;
  protected readonly developers: Signal<Array<Member>>;
  protected readonly observers: Signal<Array<Member>>;
  protected readonly scrumMaster: Signal<Member | null>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialogSvc: DialogService,
    gameSvc: GameService,
    pokerService: PokerService,
    sessionSvc: SessionService
  ) {
    this.dialogSvc = dialogSvc;
    this.sessionSvc = sessionSvc;
    // --- set signals ---
    this.canLeave = computed(() => {
      return pokerService.gameState() != EGameState.Started;
    });
    this.canPause = computed(() => {
      return sessionSvc.me()?.role != ERole.ScrumMaster && pokerService.gameState() != EGameState.Started;
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
    this.scrumMaster = computed(() => {
      return gameSvc.allMembers().find((m) => m.role == ERole.ScrumMaster) || null;
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
    this.sessionSvc.pause();
  }
  //#endregion
}
