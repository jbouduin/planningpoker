import { inject, Service, signal, WritableSignal } from '@angular/core';
import { filter, map, Observable, of } from 'rxjs';
import {
  AClientMessage,
  AServerMessage,
  ECardSet,
  EParticipantStatus,
  ERole,
  EServerMessageType,
  ICardSet,
  IErrorMessage,
  IInitMessage,
  ISelfMessage,
  ITeamNameMessage
} from 'shared-lib';
import { CreateMessage, JoinMessage, RejoinMessage } from '../../shared/dto';
import { isSessionMessage, SessionMessage } from '../messaging';
import { ApiService } from './api.service';
import { ICanRejoinResult } from './can-rejoin-result';
import { LocalStorageService } from './local-storage.service';
import { Logger } from './logger';
import { Member } from './member';
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
  //#endregion

  //#region Signals -----------------------------------------------------------
  public teamName: WritableSignal<string | null>;
  public me: WritableSignal<Member | null>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.apiSvc = inject(ApiService);
    this.localStorageSvc = inject(LocalStorageService);
    this.log = new Logger('SessionService');
    this.socketSvc = inject(SocketService);
    this.uiEventsSvc = inject(UiEventsService);
    this.teamName = signal<string | null>(null);
    this.me = signal<Member | null>(null); // new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, participantId: '' }, true);
    this.socketSvc.incomingMessage
      .pipe(filter((msg: AServerMessage) => isSessionMessage(msg)))
      .subscribe((msg: SessionMessage) => this.handleServerMessage(msg));
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
    // this.resetServices();
  }

  public createSession(
    team: string,
    nick: string,
    observer: boolean,
    cardSet: ECardSet,
    cards: ICardSet | undefined
  ): void {
    this.log.debug(`creating: ${nick}@${team}`);
    // this.status = ESessionStatus.Connecting;
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
    // this.status = ESessionStatus.Connecting;
    this.initialMessage = new JoinMessage('', {
      observer: observer,
      nick: nick
    });
    this.socketSvc.connect(team);
  }

  public rejoin(team: string, participantId: string): void {
    this.log.debug(`rejoining ${team} as ${participantId}`);
    this.initialMessage = new RejoinMessage('', participantId);
    this.socketSvc.connect(team);
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleServerMessage(message: SessionMessage): void {
    switch (message.type) {
      case EServerMessageType.Error:
        this.handleError(<IErrorMessage>message);
        break;
      case EServerMessageType.EndSession:
        this.handleEndSession();
        break;
      case EServerMessageType.ServerReset:
        this.handleServerReset();
        break;
      case EServerMessageType.TeamIdle:
        this.handleTeamIdle();
        break;
      case EServerMessageType.Init:
        this.handleInit(<IInitMessage>message);
        break;
      case EServerMessageType.Self:
        this.handleSelf(<ISelfMessage>message);
        break;
      case EServerMessageType.TeamName:
        this.handleTeamName(<ITeamNameMessage>message);
        break;
      case EServerMessageType.Ping:
        break;
    }
  }

  private handleError(message: IErrorMessage): void {
    // if (this.errorHandlerService.handleErrorMessage(message)) {
    //   this.resetServices();
    // }
    this.uiEventsSvc.showError(`Error: ${message.data.code}: ${message.data.message}`);
  }

  private handleEndSession(): void {
    if (this.me()?.role !== ERole.ScrumMaster) {
      // this.snackbarSvc.showInfo('MessageBox.The_scrummaster_has_ended_the_session.Text');
      //   const params = new MessageBoxParams();
      //   params.showCancelButton = false;
      //   params.title = this.translateService.instant('MessageBox.The_scrummaster_has_ended_the_session.Title');
      //   params.text = this.translateService.instant('MessageBox.The_scrummaster_has_ended_the_session.Text');
      //   this.dialog.open(MessageBoxComponent, {
      //     width: '250px',
      //     data: params
      //   });
    }
    this.resetService();
  }

  private handleServerReset(): void {
    // const params = new MessageBoxParams();
    // params.showCancelButton = false;
    // params.title = this.translateService.instant('MessageBox.The_server_has_been_reset.Title');
    // params.text = this.translateService.instant('MessageBox.The_server_has_been_reset.Text');
    // this.dialog.open(MessageBoxComponent, {
    //   width: '250px',
    //   data: params
    // });
    // this.snackbarSvc.showInfo('MessageBox.The_server_has_been_reset.Title');
    this.resetService();
  }

  private handleTeamIdle(): void {
    // const params = new MessageBoxParams();
    // params.showCancelButton = false;
    // params.title = this.translateService.instant('MessageBox.The_was_idle_for_to_long.Title');
    // params.text = this.translateService.instant('MessageBox.The_was_idle_for_to_long.Text');
    // this.dialog.open(MessageBoxComponent, {
    //   width: '250px',
    //   data: params
    // });
    // this.snackbarSvc.showInfo('MessageBox.The_was_idle_for_to_long.Text');
    this.resetService();
  }

  private handleInit(message: IInitMessage): void {
    if (this.initialMessage) {
      this.initialMessage.senderId = message.data.participantId;
      this.socketSvc.sendMessage(this.initialMessage);
      this.initialMessage = undefined;
    }
    this.me.set(new Member(message.data, true));
    this.localStorageSvc.participantId = message.data.participantId;
    this.localStorageSvc.nick = message.data.nick;
    // this.status = ESessionStatus.Active;
    // this.navigateTo('/game');
  }

  private handleSelf(message: ISelfMessage): void {
    const previous = this.me();
    if (message.data.status === EParticipantStatus.Left) {
      this.localStorageSvc.clear();
      this.resetService();
    } else {
      if (previous?.role === ERole.Developer && message.data.role === ERole.ScrumMaster) {
        // TODO move this to team service
        this.uiEventsSvc.showInfo('Game.Snackbar.You_are_now_scrum-master');
      }
      this.me.set(new Member(message.data, true));
      this.localStorageSvc.nick = message.data.nick;
      this.localStorageSvc.participantId = message.data.participantId;
      if (message.data.status === EParticipantStatus.Paused) {
        // this.status = ESessionStatus.Suspended;
        this.socketSvc.disconnect();
      }
    }
  }

  private handleTeamName(message: ITeamNameMessage): void {
    this.teamName.set(message.data);
    this.localStorageSvc.teamName = message.data;
  }

  private resetService(): void {
    this.me.set(null);
    this.teamName.set(null);
  }
  //#endregion
}
