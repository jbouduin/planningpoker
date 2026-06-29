import { inject, Service, signal, Signal, WritableSignal } from '@angular/core';
import {
  AServerMessageDto,
  CardSetDto,
  CardSetMessageDto,
  EGameState,
  ErrorMessageDto,
  EServerMessageType,
  ESessionEndedReason,
  EstimationDto,
  EstimationListMessageDto,
  EstimationWithdrawnMessageDto,
  GameStateChangedMessageDto,
  ParticipantChangedMessageDto,
  ParticipantChangeDto,
  ParticipantDto,
  ParticipantListMessageDto,
  SelfMessageDto,
  SessionEndedMessageDto,
  StartHandshakeMessageDto,
  TeamNameMessageDto
} from 'shared-lib';
import { ErrorHandlerService } from './error-handler.service';

@Service()
export class MessageDispatcherService {
  //#region Private Fields ----------------------------------------------------
  private readonly _cardSet: WritableSignal<CardSetDto | null>;
  private readonly _clearEstimations: WritableSignal<number>;
  private readonly _endHandshake: WritableSignal<number>;
  private readonly _sessionEnded: WritableSignal<ESessionEndedReason | null>;
  private readonly _estimationList: WritableSignal<Array<EstimationDto>>;
  private readonly _startHandshake: WritableSignal<ParticipantDto | null>;
  private readonly _participantChanged: WritableSignal<ParticipantChangeDto | null>;
  private readonly _participantList: WritableSignal<Array<ParticipantDto>>;
  private readonly _ping: WritableSignal<number>;
  private readonly _gameStateChanged: WritableSignal<EGameState>;
  private readonly _self: WritableSignal<ParticipantDto | null>;
  private readonly _serverReset: WritableSignal<number>;
  private readonly _teamIdle: WritableSignal<number>;
  private readonly _teamName: WritableSignal<string | null>;
  private readonly _estimationWithdrawn: WritableSignal<string | null>;
  private readonly errorHandlerSvc: ErrorHandlerService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this._cardSet = signal<CardSetDto | null>(null);
    this._clearEstimations = signal<number>(0);
    this._endHandshake = signal<number>(0);
    this._sessionEnded = signal<ESessionEndedReason | null>(null);
    this._estimationList = signal<Array<EstimationDto>>(new Array<EstimationDto>());
    this._startHandshake = signal<ParticipantDto | null>(null);
    this._participantChanged = signal<ParticipantChangeDto | null>(null);
    this._participantList = signal<Array<ParticipantDto>>(new Array<ParticipantDto>());
    this._ping = signal<number>(0);
    this._gameStateChanged = signal<EGameState>(EGameState.Cleared);
    this._self = signal<ParticipantDto | null>(null);
    this._serverReset = signal<number>(0);
    this._teamIdle = signal<number>(0);
    this._teamName = signal<string | null>(null);
    this._estimationWithdrawn = signal<string | null>(null);
    this.errorHandlerSvc = inject(ErrorHandlerService);
  }
  //#endregion

  //#region Getters-Setters ---------------------------------------------------
  public get cardSet(): Signal<CardSetDto | null> {
    return this._cardSet;
  }

  public get clearEstimations(): Signal<number> {
    return this._clearEstimations;
  }

  public get endHandshake(): Signal<number> {
    return this._endHandshake;
  }

  public get gameStateChanged(): Signal<EGameState> {
    return this._gameStateChanged;
  }

  public get sessionEnded(): Signal<ESessionEndedReason | null> {
    return this._sessionEnded;
  }

  public get estimationList(): Signal<Array<EstimationDto>> {
    return this._estimationList;
  }

  public get startHandshake(): Signal<ParticipantDto | null> {
    return this._startHandshake;
  }

  public get participantChanged(): Signal<ParticipantChangeDto | null> {
    return this._participantChanged;
  }

  public get participantList(): Signal<Array<ParticipantDto>> {
    return this._participantList;
  }

  public get ping(): Signal<number> {
    return this._ping;
  }

  public get self(): Signal<ParticipantDto | null> {
    return this._self;
  }

  public get teamName(): Signal<string | null> {
    return this._teamName;
  }

  public get estimationWithdrawn(): Signal<string | null> {
    return this._estimationWithdrawn;
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public processServerMessage(message: AServerMessageDto): boolean {
    let canContinue = true;
    switch (message.type) {
      case EServerMessageType.CardSet:
        this._cardSet.set((<CardSetMessageDto>message).data);
        break;
      case EServerMessageType.EstimationsCleared:
        this._clearEstimations.update((prev: number) => prev + 1);
        break;
      case EServerMessageType.EndHandshake:
        this._endHandshake.update((prev: number) => prev + 1);
        break;
      case EServerMessageType.SessionEnded:
        this._sessionEnded.set((<SessionEndedMessageDto>message).data);
        break;
      case EServerMessageType.Error:
        canContinue = this.errorHandlerSvc.processError((<ErrorMessageDto>message).data);
        break;
      case EServerMessageType.EstimationList:
        this._estimationList.set((<EstimationListMessageDto>message).data);
        break;
      case EServerMessageType.GameStateChanged:
        this._gameStateChanged.set((<GameStateChangedMessageDto>message).data);
        break;
      case EServerMessageType.StartHandshake:
        this._startHandshake.set((<StartHandshakeMessageDto>message).data);
        break;
      case EServerMessageType.ParticipantChanged:
        this._participantChanged.set((<ParticipantChangedMessageDto>message).data);
        break;
      case EServerMessageType.ParticipantList:
        this._participantList.set((<ParticipantListMessageDto>message).data);
        break;
      case EServerMessageType.Ping:
        this._ping.update((prev: number) => prev + 1);
        break;
      case EServerMessageType.Self:
        this._self.set((<SelfMessageDto>message).data);
        break;
      case EServerMessageType.TeamName:
        this._teamName.set((<TeamNameMessageDto>message).data);
        break;
      case EServerMessageType.EstimationWithdrawn:
        this._estimationWithdrawn.set((<EstimationWithdrawnMessageDto>message).data);
    }

    return canContinue;
  }

  public resetWithdrawnSignal(): void {
    this._estimationWithdrawn.set(null);
  }
  //#endregion
}
