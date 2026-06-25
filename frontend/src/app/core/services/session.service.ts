import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { AClientMessage, ECardSet, EParticipantStatus, ERole, ICardSet, IError, IParticipant } from 'shared-lib';
import { CreateMessage, JoinMessage, LeaveMessage, RejoinMessage } from '../../shared/dto';
import { extract } from '../extract';
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
  private initialMessage?: AClientMessage;
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
      const init = dispatcherSvc.init();
      if (init) {
        this.handleInit(init);
      }
    });

    effect(() => {
      if (dispatcherSvc.endInit()) {
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
    // TODO → still have to decide on this one. It is a special case as some errors do require to end the session
    effect(() => {
      const error = dispatcherSvc.error();
      if (error) {
        this.handleError(error);
      }
    });

    effect(() => {
      if (dispatcherSvc.endSession()) {
        this.handleEndSession();
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
    cardSet: ECardSet,
    cards: ICardSet | undefined
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
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleError(data: IError): void {
    // TODO create the error handler service let it handle the error as before
    //
    // if (this.errorHandlerService.handleErrorMessage(message)) {
    //   this.resetServices();
    // }
    this.uiEventsSvc.showError(`Error: ${data.code}: ${data.message}`);
  }

  private handleEndInit(): void {
    this.sessionState.set(ESessionState.Active);
  }

  private handleEndSession(): void {
    if (this.currentRole != ERole.ScrumMaster) {
      const params: ISimpleDialogParams = {
        dialogTitleKey: extract('MessageBox.The_scrummaster_has_ended_the_session.Title'),
        dialogMessageKey: extract('MessageBox.The_scrummaster_has_ended_the_session.Text')
      };
      this.uiEventsSvc.showSimpleDialog(params);
    }
    this.resetService();
  }

  private handleServerReset(): void {
    this.resetService();
  }

  private handleTeamIdle(): void {
    this.resetService();
  }

  private handleInit(data: IParticipant): void {
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

  private handleSelf(data: IParticipant): void {
    if (data.status === EParticipantStatus.Left) {
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
      if (data.status === EParticipantStatus.Paused) {
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
  }
  //#endregion
}
