import { effect, inject, Service, Signal, signal, WritableSignal } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import {
  AClientMessageDto,
  CardSetDto,
  ECardSetType,
  EParticipantState,
  ERole,
  EServerMessageType,
  ESessionEndedReason,
  ParticipantDto,
  SessionEndedMessageDto,
  TeamDto
} from 'shared-lib';
import { ENVIRONMENT } from '../../../environments/environment';
import { extract } from '../extract';
import {
  BaseClientMessage,
  CreateMessage,
  DisbandMessage,
  JoinMessage,
  LeaveMessage,
  PauseMessage,
  RejoinMessage
} from '../messages';
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
import { LoggerService } from './logger.service';

@Service()
export class SessionService {
  //#region private readonly properties ---------------------------------------
  private readonly _sessionState: WritableSignal<ESessionState>;
  private readonly apiSvc: ApiService;
  private readonly localStorageSvc: LocalStorageService;
  private readonly log: Logger;
  private readonly socketSvc: SocketService;
  private readonly uiEventsSvc: UiEventsService;
  private readonly messageDispatcher: MessageDispatcherService;
  //#endregion

  //#region private properties ------------------------------------------------
  private initialMessage?: AClientMessageDto;
  private currentRole?: ERole;
  private currentParticipantId?: string;
  //#endregion

  //#region Signals -----------------------------------------------------------
  public team: WritableSignal<TeamDto | null>;
  public me: WritableSignal<Member | null>;
  //#endregion

  //#region Getters-Setters ---------------------------------------------------
  public get sessionState(): Signal<ESessionState> {
    return this._sessionState;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency injection ---
    this.apiSvc = inject(ApiService);
    this.localStorageSvc = inject(LocalStorageService);
    this.messageDispatcher = inject(MessageDispatcherService);
    this.socketSvc = inject(SocketService);
    this.uiEventsSvc = inject(UiEventsService);

    // --- Initialize ---
    this.team = signal<TeamDto | null>(null);
    this.me = signal<Member | null>(null);
    this._sessionState = signal<ESessionState>(ESessionState.Inactive);
    this.log = LoggerService.getLogger('SessionService');

    this.registerMessageHandlers(this.messageDispatcher);

    effect(() => {
      const state = this.socketSvc.socketState();
      if (state === ESocketState.ReconnectPending) {
        const participantId = this.currentParticipantId || this.localStorageSvc.participantId;
        if (participantId) {
          this.initialMessage = new RejoinMessage('', participantId);
        }
        this._sessionState.set(ESessionState.Suspended);
      }
    });
  }

  private registerMessageHandlers(dispatcherSvc: MessageDispatcherService): void {
    effect(() => {
      const init = dispatcherSvc.startHandshake();
      if (init) {
        this.handleStartHandshake(init);
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
      const team = dispatcherSvc.team();
      if (team !== null) {
        this.team.set(team);
      }
    });

    effect(() => {
      const reason = dispatcherSvc.sessionEnded();
      if (reason) {
        switch (reason.reason) {
          case ESessionEndedReason.Disbanded:
            this.handleDisbanded();
            break;
          case ESessionEndedReason.IdleTimeOut:
            this.handleIdleTimeOut();
            break;
          case ESessionEndedReason.ServerReset:
            this.handleServerReset();
            break;
          case ESessionEndedReason.SelfInflicted:
            this.resetService();
        }
      }
    });
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public collectSessionGarbage(): void {
    this.localStorageSvc.clearSessionData();
  }

  public canRejoin(): Observable<ICanRejoinResult> {
    // Can rejoin MUST go to local storage to retrieve possible values
    const nick = this.localStorageSvc.nick;
    const team = this.localStorageSvc.teamName;
    const participantId = this.localStorageSvc.participantId;
    if (team && nick && participantId && this._sessionState() != ESessionState.Ended) {
      return this.apiSvc.checkCanRejoin(team, participantId).pipe(
        map((can: boolean) => {
          const result: ICanRejoinResult = {
            nick: nick,
            team: team,
            participantId: participantId,
            canRejoin: can
          };
          if (!can) {
            this.collectSessionGarbage();
          }
          return result;
        })
      );
    } else {
      if (team || nick || participantId) {
        this.collectSessionGarbage();
      }
      const result: ICanRejoinResult = {
        nick: nick,
        team: team,
        participantId: participantId,
        canRejoin: false
      };
      return of(result);
    }
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

  /**
   * Send disband team message.
   * Message parameters are the services' signals.
   */
  public disbandTeam(): void {
    const team = this.team();
    if (team !== null) {
      this.sendMessage(DisbandMessage, team.teamName);
    } else {
      this.handleInvalidState(true);
    }
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

  /**
   * Send leave team message.
   * Message parameters are the services' signals.
   */
  public leaveSession(): void {
    const team = this.team();
    const me = this.me();
    if (team !== null && me !== null) {
      this.sendMessage(LeaveMessage, me.participantId);
    } else {
      this.handleInvalidState(true);
    }
  }

  public leaveDisconnectedSession(team: string, participantId: string): void {
    this.initialMessage = new LeaveMessage(participantId, participantId);
    this.socketSvc.connect(team);
  }

  /**
   * Send a pause message
   * Message parameters are the services' signals.
   */
  public pause(): void {
    this.sendMessage(PauseMessage);
  }

  public sendMessage<TArgs extends Array<unknown>, TMessage extends BaseClientMessage<unknown>>(
    ctor: new (sender: string, ...args: TArgs) => TMessage,
    ...args: TArgs
  ): void {
    const me = this.me();

    if (me !== null) {
      const message = new ctor(me.participantId, ...args);
      this.socketSvc.sendMessage(message as AClientMessageDto);
      return;
    } else {
      this.handleInvalidState(false);
    }
  }

  public simulateDisconnection(): void {
    if (ENVIRONMENT.environment === 'development') {
      this.socketSvc.simulateDisconnection();
    }
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleEndInit(): void {
    this._sessionState.set(ESessionState.Active);
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
      dialogTitleKey: extract('Session.Message.Team_idle_time_out.Text'),
      dialogMessageKey: extract('Session.Message.Server_has_been_reset.Text')
    };
    this.uiEventsSvc.showSimpleDialog(params);
    this.resetService();
  }

  private handleIdleTimeOut(): void {
    const params: ISimpleDialogParams = {
      dialogTitleKey: extract('Session.Message.Team_idle_time_out.Title'),
      dialogMessageKey: extract('Session.Message.Team_idle_time_out.Text')
    };
    this.uiEventsSvc.showSimpleDialog(params);
    this.resetService();
  }

  private handleStartHandshake(data: ParticipantDto): void {
    this._sessionState.set(ESessionState.Handshaking);
    if (this.initialMessage) {
      this.initialMessage.senderId = data.participantId;
      this.socketSvc.sendMessage(this.initialMessage);
      this.initialMessage = undefined;
    }
    this.me.set(new Member(data, true));
  }

  private handleSelf(data: ParticipantDto): void {
    if (this.currentRole == ERole.Developer && data.role == ERole.ScrumMaster) {
      this.uiEventsSvc.showInfo('Game.Snackbar.You_are_now_scrum-master');
    }
    this.me.set(new Member(data, true));
    this.currentRole = data.role;
    this.currentParticipantId = data.participantId;
    if (data.state === EParticipantState.Paused) {
      this._sessionState.set(ESessionState.Suspended);
      this.socketSvc.disconnect();
    }
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  private handleInvalidState(silent: boolean): void {
    if (!silent) {
      this.uiEventsSvc.showError(extract('App.Snackbar.Invalid_Session_State'));
    }
    const sessionEndedMessageDto: SessionEndedMessageDto = {
      data: { reason: ESessionEndedReason.SelfInflicted },
      type: EServerMessageType.SessionEnded
    };
    this.messageDispatcher.processServerMessage(sessionEndedMessageDto);
  }

  /**
   * Reset the signals to initial values and disconnect the socket
   */
  private resetService(): void {
    this.me.set(null);
    this.team.set(null);
    this._sessionState.set(ESessionState.Ended);
    this.socketSvc.disconnect();
  }
  //#endregion
}
