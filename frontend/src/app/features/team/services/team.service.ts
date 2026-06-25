import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { EMemberChangeType, EParticipantStatus, IMemberChange, IParticipant } from 'shared-lib';
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
  public members: WritableSignal<Array<IParticipant>>;
  //#region

  //#region Constructor & C° -------------------------------------------------
  public constructor() {
    // Inject other service
    this.socketSvc = inject(SocketService);
    this.uiEventsSvc = inject(UiEventsService);
    // Initialize service signals
    this.members = signal<Array<IParticipant>>(new Array<IParticipant>());
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

  private handleMemberList(data: Array<IParticipant>): void {
    this.members.set(data);
  }

  private handleMemberChanged(data: IMemberChange): void {
    const participant = data.member;
    switch (data.memberStatusChange) {
      case EMemberChangeType.ChangedNick:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, nick: participant.nick } : p
          )
        );
        break;
      case EMemberChangeType.ChangedRole:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, role: participant.role } : p
          )
        );
        break;
      case EMemberChangeType.Disconnected:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantStatus.Disconnected } : p
          )
        );
        break;
      case EMemberChangeType.Joined:
        this.members.update((current: Array<IParticipant>) => [...current, participant]);
        break;
      case EMemberChangeType.Left:
        this.members.update((current: Array<IParticipant>) =>
          current.filter((p: IParticipant) => p.participantId !== participant.participantId)
        );
        break;
      case EMemberChangeType.Observe:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, observer: participant.observer } : p
          )
        );
        break;
      case EMemberChangeType.Paused:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantStatus.Paused } : p
          )
        );
        break;
      case EMemberChangeType.Rejoined:
        this.members.update((current: Array<IParticipant>) =>
          current.map((p: IParticipant) =>
            p.participantId === participant.participantId ? { ...p, status: EParticipantStatus.Connected } : p
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
