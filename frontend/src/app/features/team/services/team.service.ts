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
  ISimpleDialogParams,
  Member,
  MessageDispatcherService,
  SnackbarParams,
  SocketService,
  UiEventsService
} from '../../../core';
import {
  ChangeNickMessage,
  ChangeScrumMasterMessage,
  RemoveParticipantMessage,
  ToggleObserverMessage
} from '../../../shared/dto';

@Service()
export class TeamService {
  //#region private readonly fields -------------------------------------------
  private readonly socketSvc: SocketService;
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
    // --- Inject other service ---
    this.socketSvc = inject(SocketService);
    this.uiEventsSvc = inject(UiEventsService);
    // --- Initialize service signals ---
    this.participants = signal<Array<ParticipantDto>>(new Array<ParticipantDto>());
    // --- register message handlers ---
    const dispatcherSvc = inject(MessageDispatcherService);
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
        switch (reason) {
          case ESessionEndedReason.IdleTimeOut:
            this.handleIdleTimeOut();
            break;
          case ESessionEndedReason.ServerReset:
            this.handleServerReset();
            break;
        }
      }
    });
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public changeScrumMaster(myParticipantId: string, participantId: string): void {
    const message = new ChangeScrumMasterMessage(myParticipantId, participantId);
    this.socketSvc.sendMessage(message);
  }

  public changeNick(myParticipantId: string, nick: string): void {
    const message = new ChangeNickMessage(myParticipantId, nick);
    this.socketSvc.sendMessage(message);
  }

  public removeParticipant(myParticipantId: string, participantId: string): void {
    const message = new RemoveParticipantMessage(myParticipantId, participantId);
    this.socketSvc.sendMessage(message);
  }

  public switchObserving(myParticipantId: string, participantId: string, observe: boolean): void {
    const data: ToggleObserverDto = {
      participantId: participantId,
      observer: observe
    };
    const message = new ToggleObserverMessage(myParticipantId, data);
    this.socketSvc.sendMessage(message);
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
            SnackbarParams.info(extract('Team.Snackbar.$oldNick_changed_to_$newNick'), {
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
          SnackbarParams.info(extract('Team.Snackbar.$nick_is_now_$role'), {
            nick: participant.nick,
            role: participant.role
          })
        );
        break;
      case EParticipantChangeType.Disconnected:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantState.Disconnected } : p
          )
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarParams.info(extract('Team.Snackbar.$nick_was_disconnected'), {
            nick: participant.nick
          })
        );
        break;
      case EParticipantChangeType.Joined:
        this.participants.update((current: Array<ParticipantDto>) => [...current, participant]);
        this.uiEventsSvc.snackbar.set(
          SnackbarParams.info(extract('Team.Snackbar.$nick_joined'), {
            nick: participant.nick
          })
        );
        break;
      case EParticipantChangeType.Left:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.filter((p: ParticipantDto) => p.participantId !== participant.participantId)
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarParams.info(extract('Team.Snackbar.$nick_left'), {
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
        this.uiEventsSvc.snackbar.set(SnackbarParams.info(message, { nick: participant.nick }));
        break;
      case EParticipantChangeType.Paused:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantState.Paused } : p
          )
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarParams.info(extract('Team.Snackbar.$nick_paused'), {
            nick: participant.nick
          })
        );
        break;
      case EParticipantChangeType.Rejoined:
        this.participants.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantState.Connected } : p
          )
        );
        this.uiEventsSvc.snackbar.set(
          SnackbarParams.info(extract('Team.Snackbar.$nick_rejoined'), {
            nick: participant.nick
          })
        );
        break;
    }
  }

  private handleIdleTimeOut(): void {
    const params: ISimpleDialogParams = {
      dialogTitleKey: extract('Team.Message.Team_idle_time_out.Title'),
      dialogMessageKey: extract('Team.Message.Team_idle_time_out.Text')
    };
    this.uiEventsSvc.showSimpleDialog(params);
    this.resetService();
  }

  private handleServerReset(): void {
    this.resetService();
  }

  private resetService(): void {
    this.participants.set(new Array<Member>());
  }
  //#endregion
}
