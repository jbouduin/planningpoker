import { CommonModule } from '@angular/common';
import { Component, computed, Input, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { EErrorCode, EGameState, EParticipantState, ERole, ParticipantDto } from 'shared-lib';
import { ErrorHandlerService, extract, Member, SessionService } from '../../../../core';
import { DialogService } from '../../../../shared';
import {
  AppTranslationKeys,
  ChangeNickDialogComponent,
  MessageDialogComponentParams,
  SelectParticipantDialogComponent,
  SelectParticipantDialogComponentParams
} from '../../../../shared/components';
import { TeamService } from '../../../team';
import { PokerService } from '../../services';
import { MemberComponentState } from './member.component.state';

@Component({
  selector: 'app-member',
  imports: [MatMenuModule, CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss'
})
export class MemberComponent {
  //#region Component Inputs --------------------------------------------------
  @Input({ required: true }) public member!: Member;
  //#endregion

  //#region Translation keys --------------------------------------------------
  protected readonly START_ESTIMATING_LABEL = extract('Game.Member.MenuItem.Start_estimating');
  protected readonly STOP_ESTIMATING_LABEL = extract('Game.Member.MenuItem.Stop_estimating');
  protected readonly CHANGE_NICK_LABEL = extract('Game.Member.MenuItem.Change_nick');
  protected readonly CHANGE_SCRUM_MASTER_LABEL = extract('Game.Member.MenuItem.Change_scrummaster');
  protected readonly REMOVE_PARTICIPANT_LABEL = extract('Game.Member.MenuItem.Remove_participant');
  //#endregion

  //#region Private Fields ----------------------------------------------------
  private readonly dialogSvc: DialogService;
  private readonly errorHandlerSvc: ErrorHandlerService;
  private readonly sessionSvc: SessionService;
  private readonly teamSvc: TeamService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly componentState: Signal<MemberComponentState>;
  //#endregion

  //#region Getters: Icons ----------------------------------------------------
  public get connectionStatusIcon(): string {
    switch (this.member.state) {
      case EParticipantState.Connected:
        return 'cloud';
      case EParticipantState.Paused:
        return 'notifications_paused';
      case EParticipantState.Disconnected:
      default:
        return 'cloud_off';
    }
  }

  public get personIcon(): string {
    return this.member.observer ? 'person_outline' : 'person';
  }
  //#endregion

  //#region Getters: Menu enabling/disabling ----------------------------------
  protected get canChangeNick(): boolean {
    return this.member.me;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialogSvc: DialogService,
    errorHandlerSvc: ErrorHandlerService,
    pokerSvc: PokerService,
    sessionSvc: SessionService,
    teamSvc: TeamService
  ) {
    // --- Assign private fields ---
    this.dialogSvc = dialogSvc;
    this.errorHandlerSvc = errorHandlerSvc;
    this.sessionSvc = sessionSvc;
    this.teamSvc = teamSvc;

    // --- Set signals ---
    this.componentState = computed(() => {
      const me = sessionSvc.me();
      const gameState = pokerSvc.gameState();

      let result: MemberComponentState;
      if (me) {
        result = {
          canChangeScrumMaster: me.role == ERole.ScrumMaster && this.member.me,
          canRemoveParticipant:
            me.role == ERole.ScrumMaster &&
            this.member.participantId !== me.participantId &&
            // FEATURE allow the scrum master to kick out anyone -> requires different handling on the server and EParticipantState (which is required anyway)
            this.member.state === EParticipantState.Disconnected,
          canSwitchToObserver:
            me.role == ERole.ScrumMaster ? !this.member.observer : !this.member.observer && this.member.me,
          canSwitchToNonObserver:
            me.role == ERole.ScrumMaster ? this.member.observer : this.member.observer && this.member.me,
          removeParticipantDisabled: gameState == EGameState.Started,
          changeScrumMasterDisabled:
            gameState == EGameState.Started ||
            teamSvc.participants().filter((p: ParticipantDto) => p.state == EParticipantState.Connected).length < 1,
          obServerSwitchDisabled: gameState == EGameState.Started
        };
      } else {
        result = {
          canChangeScrumMaster: false,
          canRemoveParticipant: false,
          canSwitchToObserver: false,
          canSwitchToNonObserver: false,
          removeParticipantDisabled: false,
          changeScrumMasterDisabled: false,
          obServerSwitchDisabled: false
        };
      }
      return result;
    });
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public changeNickClick(): void {
    const me = this.sessionSvc.me();
    if (me) {
      this.dialogSvc
        .openDialog<ChangeNickDialogComponent, void, string>(ChangeNickDialogComponent, { width: '350px' })
        .subscribe((nick: string) => {
          if (nick) {
            this.teamSvc.changeNick(me.participantId, nick);
          }
        });
    }
  }

  public changeScrumMasterClick(): void {
    const me = this.sessionSvc.me();
    if (me) {
      const params: SelectParticipantDialogComponentParams = {
        titleKey: extract('ChangeScrumMasterDialog..Title'),
        participantLabelKey: extract('ChangeScrumMasterDialog.Select.ScrumMaster.Label'),
        participants: this.teamSvc
          .participants()
          .filter((participant: ParticipantDto) => participant.participantId !== me.participantId)
      };
      this.dialogSvc
        .openDialog<SelectParticipantDialogComponent, SelectParticipantDialogComponentParams, string>(
          SelectParticipantDialogComponent,
          {
            width: '350px',
            data: params
          }
        )
        .subscribe((newScrumMaster: string) => {
          if (newScrumMaster) {
            this.teamSvc.changeScrumMaster(me.participantId, newScrumMaster);
          }
        });
    }
  }

  public switchObserverClick(observe: boolean): void {
    const me = this.sessionSvc.me();
    if (me) {
      this.teamSvc.switchObserving(me.participantId, this.member.participantId, observe);
    }
  }

  public removeParticipantClick(): void {
    const me = this.sessionSvc.me();
    if (me) {
      if (me.role != ERole.ScrumMaster) {
        this.errorHandlerSvc.processError({
          code: EErrorCode.ScrumMasterRequired,
          message: null
        });
      } else {
        const params = new MessageDialogComponentParams();
        params.cancelButtonLabelKey = AppTranslationKeys.BUTTON_NO_LABEL;
        params.okButtonLabelKey = AppTranslationKeys.BUTTON_YES_LABEL;
        params.textKey = extract('Game.Confirmation.Remove_$nick_from_team.Text');
        params.textParams = { nick: this.member.nick };
        params.titleKey = extract('Game.Confirmation.Remove_$nick_from_team.Text');
        this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.teamSvc.removeParticipant(me.participantId, this.member.participantId);
          }
        });
      }
    }
  }
  //#endregion
}
