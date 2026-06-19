import { Injectable } from "@angular/core";
import { filter } from "rxjs";
import { AClientMessage, AServerMessage, ECardSet, EParticipantStatus, ERole, EServerMessageType, ICardSet, IErrorMessage, IInitMessage, ISelfMessage, ITeamNameMessage } from "shared-lib";
import { SnackbarService } from "../../shared/service/snackbar.service";
import { isSessionMessage, SessionMessage } from "../messaging";
import { LocalStorageService } from "./local-storage.service";
import { Member } from "./member";
import { SocketService } from "./socket.service";
import { Logger } from "./logger";
import { CreateMessage, JoinMessage } from "../../shared/dto";

@Injectable({ providedIn: 'root' })
export class SessionService {

  //#region private readonly properties ---------------------------------------
  private readonly localStorage: LocalStorageService;
  private readonly log: Logger;
  private readonly snackbarService: SnackbarService;
  private readonly socketService: SocketService;
  //#endregion

  //#region private properties ------------------------------------------------
  private initialMessage?: AClientMessage;
  private me: Member;
  private _teamName: string;
  //#endregion

  //#region private setters ---------------------------------------------------
  private set teamName(value: string) {
    this._teamName = value;
    this.localStorage.teamName = this.teamName;
  }
  //#endregion

  //#region public getters ----------------------------------------------------
  public get teamName(): string {
    return this._teamName;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(socketService: SocketService, snackbarService: SnackbarService, localStorage: LocalStorageService) {
    this.localStorage = localStorage;
    this.log = new Logger("SessionService");
    this.snackbarService = snackbarService;
    this.socketService = socketService;
    this._teamName = '';
    this.me = new Member({ nick: '', observer: true, role: ERole.Unknown, status: EParticipantStatus.Unknown, participantId: '' }, true);
    socketService.incomingMessage
      .pipe(
        filter((msg: AServerMessage) => isSessionMessage(msg))
      )
      .subscribe((msg: SessionMessage) => this.handleServerMessage(msg));
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public createSession(team: string, nick: string, observer: boolean, cardSet: ECardSet, cards: ICardSet | undefined): void {
      this.log.debug(`creating: ${nick}@${team}`);
      // this.status = ESessionStatus.Connecting;
      this.initialMessage = new CreateMessage(
        '',
        {
          observer: observer || false,
          nick: nick,
          cardSet: cardSet,
          cards: cards
        }
      );
      this.socketService.connect(team);
    }

    public joinSession(team: string, nick: string, observer: boolean): void {
      this.log.debug(`joining: ${nick}@${team}`);
      // this.status = ESessionStatus.Connecting;
      this.initialMessage = new JoinMessage(
        '',
        {
          observer: observer,
          nick: nick
        }
      );
      this.socketService.connect(team);
    }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleServerMessage(message: SessionMessage): void {
    console.log("Sessionservice incoming message", message.type, message.data);
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
    console.error(message.data);
    // if (this.errorHandlerService.handleErrorMessage(message)) {
    //   this.resetServices();
    // }
    this.snackbarService.showError(`Error: ${message.data.code}: ${message.data.message}`);
  }

  private handleEndSession(): void {
    if (this.me.role !== ERole.ScrumMaster) {
      this.snackbarService.showInfo('MessageBox.The_scrummaster_has_ended_the_session.Text');
    //   const params = new MessageBoxParams();
    //   params.showCancelButton = false;
    //   params.title = this.translateService.instant('MessageBox.The_scrummaster_has_ended_the_session.Title');
    //   params.text = this.translateService.instant('MessageBox.The_scrummaster_has_ended_the_session.Text');

    //   this.dialog.open(MessageBoxComponent, {
    //     width: '250px',
    //     data: params
    //   });
    }
    console.log("End session handler");
    // this.resetServices();
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
    this.snackbarService.showInfo('MessageBox.The_server_has_been_reset.Title');
    console.warn("Server reset handler");
    // this.resetServices();
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
    this.snackbarService.showInfo('MessageBox.The_was_idle_for_to_long.Text');
    console.warn("Team idle handler");
    // this.resetServices();
  }

  private handleInit(message: IInitMessage): void {
    if (this.initialMessage) {
      this.initialMessage.senderId = message.data.participantId;
      this.socketService.sendMessage(this.initialMessage);
      this.initialMessage = undefined;
    }
    this.me = new Member(message.data, true);
    this.localStorage.participantId = this.me.participantId;
    // this.status = ESessionStatus.Active;
    // this.navigateTo('/game');
  }

  private handleSelf(message: ISelfMessage): void {
    if (message.data.status === EParticipantStatus.Left) {
      this.localStorage.clear();
      // this.resetServices();
    } else {
      if (this.me.role === ERole.Developer && message.data.role === ERole.ScrumMaster) {
        //   this.snackbar.showInfo(     this.translateService.instant('Game.Snackbar.You_are_now_scrum-master'));
        this.snackbarService.showInfo('Game.Snackbar.You_are_now_scrum-master');
      }
      this.me = new Member((<ISelfMessage>message).data, true);
      this.localStorage.nick = this.me.nick;
      this.localStorage.participantId = this.me.participantId;
      if (this.me.status === EParticipantStatus.Paused) {
        // this.status = ESessionStatus.Suspended;
        this.socketService.disconnect();
      }
    }
  }

  private handleTeamName(message: ITeamNameMessage): void {

  }
  //#endregion


}
