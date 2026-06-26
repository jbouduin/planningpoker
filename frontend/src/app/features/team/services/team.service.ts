import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { EParticipantChangeType, EParticipantState, ParticipantChangeDto, ParticipantDto } from 'shared-lib';
import {
  extract,
  ISimpleDialogParams,
  Member,
  MessageDispatcherService,
  SocketService,
  UiEventsService
} from '../../../core';

@Service()
export class TeamService {
  //#region private readonly properties ---------------------------------------
  private readonly socketSvc: SocketService;
  private readonly uiEventsSvc: UiEventsService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  public members: WritableSignal<Array<ParticipantDto>>;
  //#region

  //#region Constructor & C° -------------------------------------------------
  public constructor() {
    // Inject other service
    this.socketSvc = inject(SocketService);
    this.uiEventsSvc = inject(UiEventsService);
    // Initialize service signals
    this.members = signal<Array<ParticipantDto>>(new Array<ParticipantDto>());
    // register message handlers
    const dispatcherSvc = inject(MessageDispatcherService);
    this.registerMessageHandlers(dispatcherSvc);
  }

  private registerMessageHandlers(dispatcherSvc: MessageDispatcherService): void {
    effect(() => {
      if (dispatcherSvc.endSession()) {
        this.handleEndSession();
      }
    });
    effect(() => {
      this.handleMemberList(dispatcherSvc.memberList());
    });

    effect(() => {
      const memberChanged = dispatcherSvc.memberChanged();
      if (memberChanged) {
        this.handleMemberChanged(memberChanged);
      }
    });
    effect(() => {
      if (dispatcherSvc.serverReset()) {
        this.handleServerReset();
      }
    });
    effect(() => {
      if (dispatcherSvc.teamIdle()) {
        this.handleTeamIdle();
      }
    });
  }

  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleEndSession(): void {
    this.resetService();
  }

  private handleMemberList(data: Array<ParticipantDto>): void {
    this.members.set(data);
  }

  private handleMemberChanged(data: ParticipantChangeDto): void {
    const participant = data.member;
    switch (data.changeType) {
      case EParticipantChangeType.ChangedNick:
        this.members.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, nick: participant.nick } : p
          )
        );
        break;
      case EParticipantChangeType.ChangedRole:
        this.members.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, role: participant.role } : p
          )
        );
        break;
      case EParticipantChangeType.Disconnected:
        this.members.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantState.Disconnected } : p
          )
        );
        break;
      case EParticipantChangeType.Joined:
        this.members.update((current: Array<ParticipantDto>) => [...current, participant]);
        break;
      case EParticipantChangeType.Left:
        this.members.update((current: Array<ParticipantDto>) =>
          current.filter((p: ParticipantDto) => p.participantId !== participant.participantId)
        );
        break;
      case EParticipantChangeType.Observe:
        this.members.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, observer: participant.observer } : p
          )
        );
        break;
      case EParticipantChangeType.Paused:
        this.members.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantState.Paused } : p
          )
        );
        break;
      case EParticipantChangeType.Rejoined:
        this.members.update((current: Array<ParticipantDto>) =>
          current.map((p: ParticipantDto) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantState.Connected } : p
          )
        );
        break;
    }
  }

  private handleTeamIdle(): void {
    const params: ISimpleDialogParams = {
      dialogTitleKey: extract('MessageBox.The_was_idle_for_to_long.Title'),
      dialogMessageKey: extract('MessageBox.The_was_idle_for_to_long.Text')
    };
    this.uiEventsSvc.showSimpleDialog(params);
    this.resetService();
  }

  private handleServerReset(): void {
    const params: ISimpleDialogParams = {
      dialogTitleKey: extract('MessageBox.The_server_has_been_reset.Title'),
      dialogMessageKey: extract('MessageBox.The_server_has_been_reset.Text')
    };
    this.uiEventsSvc.showSimpleDialog(params);
    this.resetService();
  }

  private resetService(): void {
    this.members.set(new Array<Member>());
  }
  //#endregion
}
