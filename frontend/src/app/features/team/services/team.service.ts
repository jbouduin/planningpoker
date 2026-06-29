import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import {
  EParticipantChangeType,
  EParticipantState,
  ObserverChangeDto,
  ParticipantChangeDto,
  ParticipantDto
} from 'shared-lib';
import {
  extract,
  ISimpleDialogParams,
  Member,
  MessageDispatcherService,
  SocketService,
  UiEventsService
} from '../../../core';
import { ChangeNickMessage, ChangeScrumMasterMessage, SwitchObserverMessage, RemoveMessage } from '../../../shared/dto';

@Service()
export class TeamService {
  //#region private readonly fields -------------------------------------------
  private readonly socketSvc: SocketService;
  private readonly uiEventsSvc: UiEventsService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  // TODO rename to participants
  /**
   * Participants, NOT including myself.
   */
  public members: WritableSignal<Array<ParticipantDto>>;
  //#region

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Inject other service ---
    this.socketSvc = inject(SocketService);
    this.uiEventsSvc = inject(UiEventsService);
    // --- Initialize service signals ---
    this.members = signal<Array<ParticipantDto>>(new Array<ParticipantDto>());
    // --- register message handlers ---
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
    const message = new RemoveMessage(myParticipantId, participantId);
    this.socketSvc.sendMessage(message);
  }

  public switchObserving(myParticipantId: string, participantId: string, observe: boolean): void {
    const data: ObserverChangeDto = {
      member: participantId,
      observer: observe
    };
    const message = new SwitchObserverMessage(myParticipantId, data);
    this.socketSvc.sendMessage(message);
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
    // TODO: snackbars if not self
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
