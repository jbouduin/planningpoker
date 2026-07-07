import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import {
  EParticipantChangeType,
  EParticipantState,
  ESessionEndedReason,
  ParticipantChangeDto,
  ParticipantDto,
  ToggleObserverDto
} from 'shared-lib';
import {
  extract,
  Member,
  MessageDispatcherService,
  SessionService,
  SnackbarComponentParams,
  UiEventsService
} from '../../../core';
import {
  ChangeNickMessage,
  ChangeScrumMasterMessage,
  RemoveParticipantMessage,
  ToggleObserverMessage
} from '../messages';

@Service()
export class TeamService {
  //#region private readonly fields -------------------------------------------
  private readonly sessionSvc: SessionService;
  private readonly uiEventsSvc: UiEventsService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  /**
   * Participants, NOT including myself.
   */
  public participants: WritableSignal<Array<ParticipantDto>>;
  //#region

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency Injection ---
    this.sessionSvc = inject(SessionService);
    this.uiEventsSvc = inject(UiEventsService);
    const dispatcherSvc = inject(MessageDispatcherService);

    // --- Initialize ---
    this.participants = signal<Array<ParticipantDto>>(new Array<ParticipantDto>());
    this.registerMessageHandlers(dispatcherSvc);
  }

  private registerMessageHandlers(dispatcherSvc: MessageDispatcherService): void {
    effect(() => {
      if (dispatcherSvc.sessionEnded()) {
        this.handleEndSession();
      }
    });
    effect(() => {
      this.handleParticipantList(dispatcherSvc.participantList());
    });

    effect(() => {
      const memberChanged = dispatcherSvc.participantChanged();
      if (memberChanged) {
        this.handleParticipantChanged(memberChanged);
      }
    });
    effect(() => {
      const reason = dispatcherSvc.sessionEnded();
      if (reason) {
        switch (reason.reason) {
          case ESessionEndedReason.IdleTimeOut:
          case ESessionEndedReason.ServerReset:
            this.resetService();
        }
      }
    });
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public changeScrumMaster(myParticipantId: string, participantId: string): void {
    this.sessionSvc.sendMessage(ChangeScrumMasterMessage, participantId);
  }

  public changeNick(myParticipantId: string, nick: string): void {
    this.sessionSvc.sendMessage(ChangeNickMessage, nick);
  }

  public removeParticipant(myParticipantId: string, participantId: string): void {
    this.sessionSvc.sendMessage(RemoveParticipantMessage, participantId);
  }

  public switchObserving(myParticipantId: string, participantId: string, observe: boolean): void {
    const data: ToggleObserverDto = {
      participantId: participantId,
      observer: observe
    };
    this.sessionSvc.sendMessage(ToggleObserverMessage, data);
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleEndSession(): void {
    this.resetService();
  }

  private handleParticipantList(data: Array<ParticipantDto>): void {
    this.participants.set(data);
  }

  private handleParticipantChanged(data: ParticipantChangeDto): void {
    const participant = data.member;
    switch (data.changeType) {
      case EParticipantChangeType.ChangedNick:
        let oldNick: string | null = null;
        let newNick: string | null = null;
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) => {
            let result: ParticipantDto;
            if (p.participantId === participant.participantId) {
              oldNick = p.nick;
              newNick = participant.nick;
              result = { ...p, nick: participant.nick };
            } else {
              result = p;
            }
            return result;
          })
        );
        if (oldNick !== null && newNick !== null) {
          this.uiEventsSvc.snackbar.set(
            SnackbarComponentParams.info(extract('Team.Snackbar.$oldNick_changed_to_$newNick'), {
              oldNick: oldNick,
              newNick: newNick
            })
          );
        }
        break;
      case EParticipantChangeType.ChangedRole:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, role: participant.role } : p
          )
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarComponentParams.info(extract('Team.Snackbar.$nick_is_now_$role'), {
            nick: participant.nick,
            role: participant.role
          })
        );
        break;
      case EParticipantChangeType.Disconnected:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, state: EParticipantState.Disconnected } : p
          )
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarComponentParams.info(extract('Team.Snackbar.$nick_was_disconnected'), {
            nick: participant.nick
          })
        );
        break;
      case EParticipantChangeType.Joined:
        this.participants.update((current: Array<ParticipantDto>) => [...current, participant]);
        this.uiEventsSvc.snackbar.set(
          SnackbarComponentParams.info(extract('Team.Snackbar.$nick_joined'), {
            nick: participant.nick
          })
        );
        break;
      case EParticipantChangeType.Left:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.filter((p: ParticipantDto) => p.participantId !== participant.participantId)
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarComponentParams.info(extract('Team.Snackbar.$nick_left'), {
            nick: participant.nick
          })
        );
        break;
      case EParticipantChangeType.Observe:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, observer: participant.observer } : p
          )
        );
        const message =
          participant.observer == true
            ? extract('Team.Snackbar.$nick_stops_estimating')
            : extract('Team.Snackbar.$nick_starts_estimating');
        this.uiEventsSvc.snackbar.set(SnackbarComponentParams.info(message, { nick: participant.nick }));
        break;
      case EParticipantChangeType.Paused:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, state: participant.state } : p
          )
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarComponentParams.info(extract('Team.Snackbar.$nick_paused'), {
            nick: participant.nick
          })
        );
        break;
      case EParticipantChangeType.Rejoined:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, state: EParticipantState.Connected } : p
          )
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarComponentParams.info(extract('Team.Snackbar.$nick_rejoined'), {
            nick: participant.nick
          })
        );
        break;
    }
  }

  private resetService(): void {
    this.participants.set(new Array<Member>());
  }
  //#endregion
}
