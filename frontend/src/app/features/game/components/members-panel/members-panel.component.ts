import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState, ERole } from 'shared-lib';
import { ENVIRONMENT } from '../../../../../environments/environment';
import { extract, Member, SessionService } from '../../../../core';
import { AppTranslationKeys, DialogService, MessageDialogComponentParams } from '../../../../shared';
import { GameService, PokerService } from '../../services';
import { MemberComponent } from '../member/member.component';
import { MembersPanelState } from './members-panel.component.state';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-members-panel',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatTooltipModule, MemberComponent, TranslatePipe],
  templateUrl: './members-panel.component.html',
  styleUrl: './members-panel.component.scss'
})
export class MembersPanelComponent {
  //#region Translation keys --------------------------------------------------
  protected readonly LEAVE_LABEL = extract('Game.MembersPanel.Button.Leave');
  protected readonly LEAVE_LABEL_TOOLTIP = extract('Game.MembersPanel.Tooltip.You_can_not_leave_during_estimations');
  protected readonly PAUSE_LABEL = extract('Game.MembersPanel.Button.Pause');
  protected readonly PAUSE_LABEL_TOOLTIP_ESTIMATIONS = extract(
    'Game.MembersPanel.Tooltip.You_can_not_pause_during_estimations'
  );
  protected readonly PAUSE_LABEL_TOOLTIP_SCRUM_MASTER = extract(
    'Game.MembersPanel.Tooltip.Assign_an_other_scrum_master_before_pausing'
  );
  protected readonly DISBAND_LABEL = extract('Game.MembersPanel.Button.DisbandTeam');
  protected readonly DISBAND_TOOLTIP = extract(
    'Game.MembersPanel.Tooltip.DisbandTeam.You_can_not_disband_during_estimations'
  );
  protected readonly SCRUM_MASTER_LABEL = extract('Game.MembersPanel.Header.ScrumMaster');
  protected readonly DEVELOPERS_LABEL = extract('Game.MembersPanel.Header.Developers');
  protected readonly OBSERVERS_LABEL = extract('Game.MembersPanel.Header.Observers');
  //#endregion

  //#region Protected Fields --------------------------------------------------
  protected readonly isDevelopment: boolean;
  //#endregion

  //#region Private fields ----------------------------------------------------
  private readonly sessionSvc: SessionService;
  private readonly dialogSvc: DialogService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly memberPanelState: Signal<MembersPanelState>;
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

      const observers = members
        .filter((m: Member) => m.observer && m.role != ERole.ScrumMaster)
        .sort((a, b) => a.nick.localeCompare(b.nick));
      const meObserver = members.find((m: Member) => m.me)?.observer || false;
      return {
        canLeave: gameState != EGameState.Started || meObserver,
        canPause: !scrumMaster?.me && (gameState != EGameState.Started || meObserver),
        developers: members
          .filter((m: Member) => !m.observer && m.role != ERole.ScrumMaster)
          .sort((a, b) => a.nick.localeCompare(b.nick)),
        leaveButtonMode: scrumMaster?.me ? 'disband' : 'leave',
        observers: observers,
        pauseButtonTooltip: scrumMaster?.me
          ? this.PAUSE_LABEL_TOOLTIP_SCRUM_MASTER
          : this.PAUSE_LABEL_TOOLTIP_ESTIMATIONS,
        scrumMaster: scrumMaster
      };
    });

    // --- others ---
    // LATER check if we can use EnvironmentInjector from @angular/core
    this.isDevelopment = ENVIRONMENT.environment === 'development';
  }
  //#endregion

  //#region UI Triggers -------------------------------------------------------
  protected disband(): void {
    const params = new MessageDialogComponentParams();
    params.cancelButtonLabelKey = AppTranslationKeys.BUTTON_NO_LABEL;
    params.okButtonLabelKey = AppTranslationKeys.BUTTON_YES_LABEL;
    params.titleKey = AppTranslationKeys.CONFIRMATION_DIALOG_TITLE;
    params.textKey = extract('Game.Confirmation.Do_you_want_to_disband_the_team.Text');
    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.disbandTeam();
      }
    });
  }

  protected disconnect(): void {
    this.sessionSvc.simulateDisconnection();
  }

  protected leave(): void {
    const params = new MessageDialogComponentParams();
    params.cancelButtonLabelKey = AppTranslationKeys.BUTTON_NO_LABEL;
    params.okButtonLabelKey = AppTranslationKeys.BUTTON_YES_LABEL;
    params.titleKey = AppTranslationKeys.CONFIRMATION_DIALOG_TITLE;
    params.textKey = extract('Game.Confirmation.Do_you_want_to_leave_the_team.Text');

    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.leaveSession();
      }
    });
  }

  protected pause(): void {
    const params = new MessageDialogComponentParams();
    params.cancelButtonLabelKey = AppTranslationKeys.BUTTON_NO_LABEL;
    params.okButtonLabelKey = AppTranslationKeys.BUTTON_YES_LABEL;
    params.titleKey = AppTranslationKeys.CONFIRMATION_DIALOG_TITLE;
    params.textKey = extract('Game.Confirmation.Do_you_want_to_pause.Text');

    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.pause();
      }
    });
  }

  //#endregion
}
