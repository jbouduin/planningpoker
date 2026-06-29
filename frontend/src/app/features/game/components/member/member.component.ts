import { CommonModule } from '@angular/common';
import { Component, computed, Input, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { EGameState, EParticipantState, ERole, ParticipantDto } from 'shared-lib';
import { extract, Member, SessionService } from '../../../../core';
import { DialogService } from '../../../../shared';
import {
  ChangeNickDialogComponent,
  SelectParticipantDialogComponent,
  SelectParticipantDialogParams
} from '../../../../shared/components';
import { TeamService } from '../../../team';
import { PokerService } from '../../services';

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

  //#region Private Fields ----------------------------------------------------
  private readonly dialogSvc: DialogService;
  private readonly sessionSvc: SessionService;
  private readonly teamSvc: TeamService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected readonly canChangeScrumMaster: Signal<boolean>;
  protected readonly canRemoveParticipant: Signal<boolean>;
  protected readonly canSwitchToObserver: Signal<boolean>;
  protected readonly canSwitchToNonObserver: Signal<boolean>;
  protected readonly changeScrumMasterDisabled: Signal<boolean>;
  protected readonly obServerSwitchDisabled: Signal<boolean>;
  protected readonly removeParticipantDisabled: Signal<boolean>;
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

  //#region Getters: Labels ---------------------------------------------------
  public get startEstimatingLabel(): string {
    return extract('Member.Component.MenuItem.Start_estimating');
  }

  public get stopEstimatingLabel(): string {
    return extract('Member.Component.MenuItem.Stop_estimating');
  }

  public get changeNickLabel(): string {
    return extract('Member.Component.MenuItem.Change_nick');
  }

  public get changeScrumMasterLabel(): string {
    return extract('Member.Component.MenuItem.Change_scrummaster');
  }

  public get removeParticipantLabel(): string {
    return extract('Member.Component.MenuItem.Remove_participant');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialogSvc: DialogService,
    pokerSvc: PokerService,
    sessionSvc: SessionService,
    teamSvc: TeamService
  ) {
    // --- Assign private fields ---
    this.dialogSvc = dialogSvc;
    this.sessionSvc = sessionSvc;
    this.teamSvc = teamSvc;

    // --- Set permission signals ---
    this.canChangeScrumMaster = computed(() => {
      const me = sessionSvc.me();
      if (me) {
        return me.role == ERole.ScrumMaster && this.member.me;
      } else {
        return false;
      }
    });
    this.canRemoveParticipant = computed(() => {
      const me = sessionSvc.me();
      if (me) {
        return (
          me.role == ERole.ScrumMaster &&
          this.member.participantId !== me.participantId &&
          // TODO shouldn't we allow the scrum master to kick out anyone
          this.member.state === EParticipantState.Disconnected
        );
      } else {
        return false;
      }
    });
    this.canSwitchToObserver = computed(() => {
      const me = sessionSvc.me();

      if (me) {
        return me.role == ERole.ScrumMaster ? !this.member.observer : !this.member.observer && this.member.me;
      } else {
        return false;
      }
    });
    this.canSwitchToNonObserver = computed(() => {
      const me = sessionSvc.me();
      if (me) {
        return me.role == ERole.ScrumMaster ? this.member.observer : this.member.observer && this.member.me;
      } else {
        return false;
      }
    });

    // --- Set disabled signals ---
    this.changeScrumMasterDisabled = computed(() => {
      return (
        pokerSvc.gameState() == EGameState.Started ||
        teamSvc.participants().filter((p: ParticipantDto) => p.state == EParticipantState.Connected).length < 1
      );
    });

    this.removeParticipantDisabled = computed(() => {
      return pokerSvc.gameState() == EGameState.Started;
    });

    // LATER if status is revealed, switching automatically adds/remove an estimation → have a state observer change pending ?
    this.obServerSwitchDisabled = computed(() => {
      return pokerSvc.gameState() == EGameState.Started;
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
      const params: SelectParticipantDialogParams = {
        titleKey: extract('ChangeScrumMasterDialog.Component.Title'),
        participantLabelKey: extract('ChangeScrumMasterDialog.Select.ScrumMaster.Label'),
        participants: this.teamSvc
          .participants()
          .filter((participant: ParticipantDto) => participant.participantId !== me.participantId)
      };
      this.dialogSvc
        .openDialog<SelectParticipantDialogComponent, SelectParticipantDialogParams, string>(
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
    // TODO confirmation
    if (me) {
      this.teamSvc.removeParticipant(me.participantId, this.member.participantId);
    }
  }
  //#endregion
}
