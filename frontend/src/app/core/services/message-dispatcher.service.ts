import { inject, Service, signal, Signal, WritableSignal } from '@angular/core';
import {
  AServerMessage,
  EPokerStatus,
  EServerMessageType,
  ICardSet,
  ICardSetMessage,
  IErrorMessage,
  IEstimation,
  IEstimationListMessage,
  IInitMessage,
  IMemberChange,
  IMemberChangeMessage,
  IMemberListMessage,
  IParticipant,
  IPokerStatusChangedMessage,
  ISelfMessage,
  ITeamNameMessage
} from 'shared-lib';
import { ErrorHandlerService } from './error-handler.service';

@Service()
export class MessageDispatcherService {
  //#region Private Fields ----------------------------------------------------
  private readonly _cardSet: WritableSignal<ICardSet | null>;
  private readonly _clearEstimations: WritableSignal<number>;
  private readonly _endInit: WritableSignal<number>;
  private readonly _endSession: WritableSignal<number>;
  private readonly _estimationList: WritableSignal<Array<IEstimation>>;
  private readonly _init: WritableSignal<IParticipant | null>;
  private readonly _memberChanged: WritableSignal<IMemberChange | null>;
  private readonly _memberList: WritableSignal<Array<IParticipant>>;
  private readonly _ping: WritableSignal<number>;
  private readonly _pokerStatus: WritableSignal<EPokerStatus>;
  private readonly _self: WritableSignal<IParticipant | null>;
  private readonly _serverReset: WritableSignal<number>;
  private readonly _teamIdle: WritableSignal<number>;
  private readonly _teamName: WritableSignal<string | null>;
  private readonly errorHandlerSvc: ErrorHandlerService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this._cardSet = signal<ICardSet | null>(null);
    this._clearEstimations = signal<number>(0);
    this._endInit = signal<number>(0);
    this._endSession = signal<number>(0);
    this._estimationList = signal<Array<IEstimation>>(new Array<IEstimation>());
    this._init = signal<IParticipant | null>(null);
    this._memberChanged = signal<IMemberChange | null>(null);
    this._memberList = signal<Array<IParticipant>>(new Array<IParticipant>());
    this._ping = signal<number>(0);
    this._pokerStatus = signal<EPokerStatus>(EPokerStatus.Cleared);
    this._self = signal<IParticipant | null>(null);
    this._serverReset = signal<number>(0);
    this._teamIdle = signal<number>(0);
    this._teamName = signal<string | null>(null);
    this.errorHandlerSvc = inject(ErrorHandlerService);
  }
  //#endregion

  //#region Getters-Setters ---------------------------------------------------
  public get cardSet(): Signal<ICardSet | null> {
    return this._cardSet;
  }

  public get clearEstimations(): Signal<number> {
    return this._clearEstimations;
  }

  public get endInit(): Signal<number> {
    return this._endInit;
  }

  public get endSession(): Signal<number> {
    return this._endSession;
  }

  public get estimationList(): Signal<Array<IEstimation>> {
    return this._estimationList;
  }

  public get init(): Signal<IParticipant | null> {
    return this._init;
  }

  public get memberChanged(): Signal<IMemberChange | null> {
    return this._memberChanged;
  }

  public get memberList(): WritableSignal<Array<IParticipant>> {
    return this._memberList;
  }

  public get ping(): WritableSignal<number> {
    return this._ping;
  }

  public get pokerStatus(): WritableSignal<EPokerStatus> {
    return this._pokerStatus;
  }

  public get self(): WritableSignal<IParticipant | null> {
    return this._self;
  }

  public get serverReset(): WritableSignal<number> {
    return this._serverReset;
  }

  public get teamIdle(): WritableSignal<number> {
    return this._teamIdle;
  }

  public get teamName(): Signal<string | null> {
    return this._teamName;
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public processServerMessage(message: AServerMessage): boolean {
    let canContinue = true;
    switch (message.type) {
      case EServerMessageType.CardList:
        this._cardSet.set((<ICardSetMessage>message).data);
        break;
      case EServerMessageType.ClearEstimations:
        this._clearEstimations.update((prev: number) => prev + 1);
        break;
      case EServerMessageType.EndInit:
        this._endInit.update((prev: number) => prev + 1);
        break;
      case EServerMessageType.EndSession:
        this._endSession.update((prev: number) => prev + 1);
        break;
      // TODO → still have to decide on this one. It is a special case as some errors do require to end the session
      case EServerMessageType.Error:
        canContinue = this.errorHandlerSvc.processError((<IErrorMessage>message).data);
        break;
      case EServerMessageType.EstimationList:
        this._estimationList.set((<IEstimationListMessage>message).data);
        break;
      case EServerMessageType.Init:
        this._init.set((<IInitMessage>message).data);
        break;
      case EServerMessageType.MemberChanged:
        this._memberChanged.set((<IMemberChangeMessage>message).data);
        break;
      case EServerMessageType.MemberList:
        this._memberList.set((<IMemberListMessage>message).data);
        break;
      case EServerMessageType.Ping:
        this._ping.update((prev: number) => prev + 1);
        break;
      case EServerMessageType.PokerStatus:
        this._pokerStatus.set((<IPokerStatusChangedMessage>message).data);
        break;
      case EServerMessageType.Self:
        this._self.set((<ISelfMessage>message).data);
        break;
      case EServerMessageType.ServerReset:
        this._serverReset.update((prev: number) => prev + 1);
        break;
      case EServerMessageType.TeamIdle:
        this._teamIdle.update((prev: number) => prev + 1);
        break;
      case EServerMessageType.TeamName:
        this._teamName.set((<ITeamNameMessage>message).data);
    }

    return canContinue;
  }
  //#endregion
}
