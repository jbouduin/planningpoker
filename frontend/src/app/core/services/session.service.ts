import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import {
  AClientMessageDto,
  CardSetDto,
  ECardSetType,
  EParticipantState,
  ERole,
  ESessionEndedReason,
  ParticipantDto
} from 'shared-lib';
import { extract } from '../extract';
import { CreateMessage, JoinMessage, LeaveMessage, RejoinMessage } from '../messages';
import { ApiService } from './api.service';
import { ICanRejoinResult } from './can-rejoin-result';
import { LocalStorageService } from './local-storage.service';
import { Logger } from './logger';
import { Member } from './member';
import { MessageDispatcherService } from './message-dispatcher.service';
import { ESessionState } from './session-state.enum';
import { ISimpleDialogParams } from './simple-dialog.params';
import { ESocketState } from './socket-state.enum';
import { SocketService } from './socket.service';
import { UiEventsService } from './ui-events.service';

@Service()
export class SessionService {
  //#region private readonly properties ---------------------------------------
  private readonly apiSvc: ApiService;
  private readonly localStorageSvc: LocalStorageService;
  private readonly log: Logger;
  private readonly socketSvc: SocketService;
  private readonly uiEventsSvc: UiEventsService;
  //#endregion

  //#region private properties ------------------------------------------------
  private initialMessage?: AClientMessageDto;
  private currentRole?: ERole;
  private currentParticipantId?: string;
  //#endregion

  //#region Signals -----------------------------------------------------------
  public teamName: WritableSignal<string | null>;
  public me: WritableSignal<Member | null>;
  public sessionState: WritableSignal<ESessionState>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // Inject other services
    this.apiSvc = inject(ApiService);
    this.localStorageSvc = inject(LocalStorageService);
    this.socketSvc = inject(SocketService);
    this.uiEventsSvc = inject(UiEventsService);
    // Create logger
    this.log = new Logger('SessionService');
    // Initialize service signals
    this.teamName = signal<string | null>(null);
    this.me = signal<Member | null>(null);
    this.sessionState = signal<ESessionState>(ESessionState.Inactive);
    // register message handlers
    const dispatcherSvc = inject(MessageDispatcherService);
    this.registerMessageHandlers(dispatcherSvc);
    // Create effects
    effect(() => {
      const state = this.socketSvc.socketStatus();
      if (state === ESocketState.ReconnectPending) {
        const participantId = this.currentParticipantId || this.localStorageSvc.participantId;
        if (participantId) {
          this.initialMessage = new RejoinMessage('', participantId);
        }
      }
    });
  }

  private registerMessageHandlers(dispatcherSvc: MessageDispatcherService): void {
    effect(() => {
      const init = dispatcherSvc.startHandshake();
      if (init) {
        this.handleInit(init);
      }
    });

    effect(() => {
      if (dispatcherSvc.endHandshake()) {
        this.handleEndInit();
      }
    });

    effect(() => {
      const self = dispatcherSvc.self();
      if (self) {
        this.handleSelf(self);
      }
    });

    effect(() => {
      const teamName = dispatcherSvc.teamName();
      if (teamName) {
        this.handleTeamName(teamName);
      }
    });

    effect(() => {
      const reason = dispatcherSvc.sessionEnded();
      if (reason) {
        switch (reason) {
          case ESessionEndedReason.Disbanded:
            this.handleDisbanded();
            break;
          case ESessionEndedReason.IdleTimeOut:
            this.handleTeamOut();
            break;
          case ESessionEndedReason.ServerReset:
            this.handleServerReset();
        }
      }
    });
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public canRejoin(): Observable<ICanRejoinResult> {
    const nick = this.localStorageSvc.nick;
    const team = this.localStorageSvc.teamName;
    const participantId = this.localStorageSvc.participantId;
    if (team && nick && participantId) {
      // this.status = ESessionStatus.Suspended;
      return this.apiSvc.checkCanRejoin(team, participantId).pipe(
        map((can: boolean) => {
          const result: ICanRejoinResult = {
            nick: nick,
            team: team,
            participantId: participantId,
            canRejoin: can
          };
          return result;
        })
      );
    } else {
      const result: ICanRejoinResult = {
        nick: nick,
        team: team,
        participantId: participantId,
        canRejoin: false
      };
      return of(result);
    }
  }

  public clearSessionData(): void {
    this.localStorageSvc.clear();
  }

  public createSession(
    team: string,
    nick: string,
    observer: boolean,
    cardSet: ECardSetType,
    cards: CardSetDto | undefined
  ): void {
    this.log.debug(`creating: ${nick}@${team}`);
    this.initialMessage = new CreateMessage('', {
      observer: observer,
      nick: nick,
      cardSet: cardSet,
      cards: cards
    });
    this.socketSvc.connect(team);
  }

  public joinSession(team: string, nick: string, observer: boolean): void {
    this.log.debug(`joining: ${nick}@${team}`);
    this.initialMessage = new JoinMessage('', {
      observer: observer,
      nick: nick
    });
    this.socketSvc.connect(team);
  }

  public rejoinSession(team: string, participantId: string): void {
    this.log.debug(`rejoining ${team} as ${participantId}`);
    this.initialMessage = new RejoinMessage('', participantId);
    this.socketSvc.connect(team);
  }

  public leaveSession(): void {
    const team = this.teamName() || this.localStorageSvc.teamName;
    const participantId = this.me()?.participantId || this.localStorageSvc.participantId;
    if (team !== null && participantId !== null) {
      const message = new LeaveMessage(participantId, participantId);
      // switch (this.status) {
      //     case ESessionStatus.Active:
      //       this.status = ESessionStatus.Stopping;
      //       this.sendMessage(message);
      //       break;
      //     case ESessionStatus.ReconnectPending:
      //       this.status = ESessionStatus.Inactive;
      //       this.resetServices();
      //       this.localStorage.clear();
      //       break;
      //     case ESessionStatus.Suspended:
      //       this.initialMessage = message;
      //       this.status = ESessionStatus.Resuming;
      //       this.connect(team);
      //   }
      this.socketSvc.sendMessage(message);
    } else {
      this.resetService();
    }
  }

  public leaveDisconnectedSession(team: string, participantId: string): void {
    this.initialMessage = new LeaveMessage(participantId, participantId);
    this.socketSvc.connect(team);
  }

  public pause(): void {
    this.uiEventsSvc.showError('Not implemented');
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleEndInit(): void {
    this.sessionState.set(ESessionState.Active);
  }

  private handleDisbanded(): void {
    if (this.currentRole != ERole.ScrumMaster) {
      const params: ISimpleDialogParams = {
        dialogTitleKey: extract('Session.Message.Team_disbanded.Title'),
        dialogMessageKey: extract('Session.Message.Team_disbanded.Message')
      };
      this.uiEventsSvc.showSimpleDialog(params);
    }
    this.resetService();
  }

  private handleServerReset(): void {
    const params: ISimpleDialogParams = {
      dialogTitleKey: extract('Session.Message.Server_has_been_reset.Title'),
      dialogMessageKey: extract('Session.Message.Server_has_been_reset.Text')
    };
    this.uiEventsSvc.showSimpleDialog(params);
    this.resetService();
  }

  private handleTeamOut(): void {
    this.resetService();
  }

  private handleInit(data: ParticipantDto): void {
    this.sessionState.set(ESessionState.Entering);
    if (this.initialMessage) {
      this.initialMessage.senderId = data.participantId;
      this.socketSvc.sendMessage(this.initialMessage);
      this.initialMessage = undefined;
    }
    this.me.set(new Member(data, true));
    this.localStorageSvc.participantId = data.participantId;
    this.localStorageSvc.nick = data.nick;
  }

  private handleSelf(data: ParticipantDto): void {
    if (data.state === EParticipantState.Left) {
      this.localStorageSvc.clear();
      this.resetService();
    } else {
      if (this.currentRole == ERole.Developer && data.role == ERole.ScrumMaster) {
        this.uiEventsSvc.showInfo('Game.Snackbar.You_are_now_scrum-master');
      }
      this.me.set(new Member(data, true));
      this.currentRole = data.role;
      this.currentParticipantId = data.participantId;
      this.localStorageSvc.nick = data.nick;
      this.localStorageSvc.participantId = data.participantId;
      if (data.state === EParticipantState.Paused) {
        this.sessionState.set(ESessionState.Suspended);
        this.socketSvc.disconnect();
      }
    }
  }

  private handleTeamName(data: string): void {
    this.teamName.set(data);
    this.localStorageSvc.teamName = data;
  }

  private resetService(): void {
    this.me.set(null);
    this.teamName.set(null);
    this.sessionState.set(ESessionState.Inactive);
    this.socketSvc.disconnect();
  }
  //#endregion
}
