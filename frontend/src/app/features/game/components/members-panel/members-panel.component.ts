import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState, ERole } from 'shared-lib';
import { extract, Member, SessionService } from '../../../../core';
import { DialogService, MessageDialogParams } from '../../../../shared';
import { GameService, PokerService } from '../../services';
import { MemberComponent } from '../member/member.component';
import { MemberPanelState } from './member-panel-state';

@Component({
  selector: 'app-members-panel',
  imports: [CommonModule, MatCardModule, MatTooltipModule, MemberComponent, TranslatePipe],
  templateUrl: './members-panel.component.html',
  styleUrl: './members-panel.component.scss'
})
export class MembersPanelComponent {
  //#region Translation keys --------------------------------------------------
  // TODO shorten the translation keys
  protected readonly LEAVE_LABEL = extract('Game.MembersPanel.Component.Button.Leave');
  protected readonly LEAVE_LABEL_TOOLTIP = extract(
    'Game.MembersPanel.Component.Tooltip.You_can_not_leave_during_estimations'
  );
  protected readonly PAUSE_LABEL = extract('Game.MembersPanel.Component.Button.Pause');
  protected readonly PAUSE_LABEL_TOOLTIP_ESTIMATIONS = extract(
    'Game.MembersPanel.Component.Tooltip.You_can_not_pause_during_estimations'
  );
  protected readonly PAUSE_LABEL_TOOLTIP_SCRUM_MASTER = extract(
    'Game.MembersPanel.Component.Tooltip.Assign_an_other_scrum_master_before_pausing'
  );
  protected readonly DISBAND_LABEL = extract('Game.MembersPanel.Component.Button.DisbandTeam');
  protected readonly DISBAND_TOOLTIP = extract(
    'Game.MembersPanel.Component.Tooltip.DisbandTeam.You_can_not_disband_during_estimations'
  );
  protected readonly SCRUM_MASTER_LABEL = extract('Game.MembersPanel.Component.Header.ScrumMaster');
  protected readonly DEVELOPERS_LABEL = extract('Game.MembersPanel.Component.Header.Developers');
  protected readonly OBSERVERS_LABEL = extract('Game.MembersPanel.Component.Header.Observers');
  //#endregion

  //#region Private fields ----------------------------------------------------
  private readonly sessionSvc: SessionService;
  private readonly dialogSvc: DialogService;
  //#endregion

  //#region Signals -----------------------------------------------------------
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
    this.memberPanelState = computed(() => {
      const members = gameSvc.allMembers();
      const scrumMaster = members.find((m) => m.role == ERole.ScrumMaster) || null;
      const gameState = pokerService.gameState();
      return {
        canLeave: gameState != EGameState.Started,
        canPause: !scrumMaster?.me && gameState != EGameState.Started,
        developers: members
          .filter((m: Member) => !m.observer && m.role != ERole.ScrumMaster)
          .sort((a, b) => a.nick.localeCompare(b.nick)),
        leaveButtonMode: scrumMaster?.me ? 'disband' : 'leave',
        observers: members
          .filter((m: Member) => m.observer && m.role != ERole.ScrumMaster)
          .sort((a, b) => a.nick.localeCompare(b.nick)),
        pauseButtonTooltip: scrumMaster?.me
          ? this.PAUSE_LABEL_TOOLTIP_SCRUM_MASTER
          : this.PAUSE_LABEL_TOOLTIP_ESTIMATIONS,
        scrumMaster: scrumMaster
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

    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.leaveSession();
      }
    });
  }

  protected pause(): void {
    const params = new MessageDialogParams();
    params.cancelButtonLabelKey = extract('App.Button.No');
    params.okButtonLabelKey = extract('App.Button.Yes');
    params.titleKey = extract('App.Confirmation.Text');
    params.textKey = extract('Game.Confirmation.Do_you_want_to_pause.Text');

    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.pause();
      }
    });
  }
  //#endregion
}
