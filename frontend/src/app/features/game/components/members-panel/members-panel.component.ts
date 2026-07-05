import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState, ERole } from 'shared-lib';
import { extract, Member, SessionService } from '../../../../core';
import { DialogService, MessageDialogParams } from '../../../../shared';
import { GameService, PokerService } from '../../services';
import { MemberComponent } from '../member/member.component';
import { MemberPanelState } from './member-panel-state';

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
  protected readonly LEAVE_LABEL = extract('Game.MembersPanel.Component.Button.Leave');
  protected readonly PAUSE_LABEL = extract('Game.MembersPanel.Component.Button.Pause');
  protected readonly DISBAND_LABEL = extract('Game.ScrumMasterButtons.Component.Button.DisbandTeam');
  protected readonly SCRUM_MASTER_LABEL = extract('Game.MembersPanel.Component.Header.ScrumMaster');
  protected readonly DEVELOPERS_LABEL = extract('Game.MembersPanel.Component.Header.Developers');
  protected readonly OBSERVERS_LABEL = extract('Game.MembersPanel.Component.Header.Observers');
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly canLeave: Signal<boolean>;
  protected readonly canPause: Signal<boolean>;
  protected readonly memberPanelState: Signal<MemberPanelState>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- dependency injection ---
    this.dialogSvc = inject(DialogService);
    this.sessionSvc = inject(SessionService);
    const pokerService = inject(PokerService);
    const gameSvc = inject(GameService);

    // --- set signals ---
    this.canLeave = computed(() => {
      return pokerService.gameState() != EGameState.Started;
    });
    this.canPause = computed(() => {
      return this.sessionSvc.me()?.role != ERole.ScrumMaster && pokerService.gameState() != EGameState.Started;
    });

    this.memberPanelState = computed(() => {
      const members = gameSvc.allMembers();
      const scrumMaster = members.find((m) => m.role == ERole.ScrumMaster) || null;
      return {
        developers: members
          .filter((m: Member) => !m.observer && m.role != ERole.ScrumMaster)
          .sort((a, b) => a.nick.localeCompare(b.nick)),
        observers: members
          .filter((m: Member) => m.observer && m.role != ERole.ScrumMaster)
          .sort((a, b) => a.nick.localeCompare(b.nick)),
        scrumMaster: scrumMaster,
        leaveButtonMode: scrumMaster?.me ? 'disband' : 'leave'
      };
    });
  }
  //#endregion

  //#region UI Triggers -------------------------------------------------------
  protected disband(): void {
    const params = new MessageDialogParams();
    params.cancelButtonLabelKey = extract('App.Button.No');
    params.okButtonLabelKey = extract('App.Button.Yes');
    params.titleKey = extract('App.Confirmation.Text');
    params.textKey = extract('Game.Confirmation.Do_you_want_to_disband_the_team.Text');
    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.disbandTeam();
      }
    });
  }

  protected leave(): void {
    const params = new MessageDialogParams();
    params.cancelButtonLabelKey = extract('App.Button.No');
    params.okButtonLabelKey = extract('App.Button.Yes');
    params.titleKey = extract('App.Confirmation.Text');
    params.textKey = extract('Game.Confirmation.Do_you_want_to_leave_the_team.Text');
    // LATER implement messages in leave trigger
    // - scrum master can not leave before assigning another scrum master
    // - other participants: if has estimated, warn that estimation will dissapear

    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.leaveSession();
      }
    });
  }

  protected pause(): void {
    // LATER implement messages in pause trigger
    // - scrum master can not pause before assigning another scrum master
    // - other participants: if has estimated, warn that estimation will dissapear
    // - confirmation dialog
    extract('Game.Message.Assign_another_scrum_master_first.Title');
    extract('Game.Message.Assign_another_scrum_master_first.Text');
    extract('Game.Message.Pause_will_withdraw_your_estimation.Title');
    extract('Game.Message.Pause_will_withdraw_your_estimation.Text');
    extract('Game.Confirmation.Do_you_want_to_pause.Title');
    extract('Game.Confirmation.Do_you_want_to_pause.Text');
    this.sessionSvc.pause();
  }
  //#endregion
}
