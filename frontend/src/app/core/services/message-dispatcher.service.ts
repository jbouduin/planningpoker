import { inject, Service, signal, Signal, WritableSignal } from '@angular/core';
import {
  AServerMessageDto,
  CardSetDto,
  CardSetMessageDto,
  EGameState,
  ErrorMessageDto,
  EServerMessageType,
  EstimationDto,
  EstimationListMessageDto,
  EstimationWithdrawnDto,
  EstimationWithdrawnMessageDto,
  GameStateChangedDto,
  GameStateChangedMessageDto,
  ParticipantChangedMessageDto,
  ParticipantChangeDto,
  ParticipantDto,
  ParticipantListMessageDto,
  SelfMessageDto,
  SessionEndedDto,
  SessionEndedMessageDto,
  StartHandshakeMessageDto,
  TeamDto,
  TeamMessageDto
} from 'shared-lib';
import { ErrorHandlerService } from './error-handler.service';

@Service()
export class MessageDispatcherService {
  //#region Private Fields ----------------------------------------------------
  private readonly _cardSet: WritableSignal<CardSetDto | null>;
  private readonly _clearEstimations: WritableSignal<number>;
  private readonly _endHandshake: WritableSignal<number>;
  private readonly _sessionEnded: WritableSignal<SessionEndedDto | null>;
  private readonly _estimationList: WritableSignal<Array<EstimationDto>>;
  private readonly _startHandshake: WritableSignal<ParticipantDto | null>;
  private readonly _participantChanged: WritableSignal<ParticipantChangeDto | null>;
  private readonly _participantList: WritableSignal<Array<ParticipantDto>>;
  private readonly _ping: WritableSignal<number>;
  private readonly _gameStateChanged: WritableSignal<GameStateChangedDto>;
  private readonly _self: WritableSignal<ParticipantDto | null>;
  private readonly _team: WritableSignal<TeamDto | null>;
  private readonly _estimationWithdrawn: WritableSignal<EstimationWithdrawnDto | null>;
  private readonly errorHandlerSvc: ErrorHandlerService;
  //#endregion

  //#region Getters: Signals --------------------------------------------------
  public get cardSet(): Signal<CardSetDto | null> {
    return this._cardSet;
  }

  public get clearEstimations(): Signal<number> {
    return this._clearEstimations;
  }

  public get endHandshake(): Signal<number> {
    return this._endHandshake;
  }

  public get gameStateChanged(): Signal<GameStateChangedDto> {
    return this._gameStateChanged;
  }

  public get sessionEnded(): Signal<SessionEndedDto | null> {
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

  public get team(): Signal<TeamDto | null> {
    return this._team;
  }

  public get estimationWithdrawn(): Signal<EstimationWithdrawnDto | null> {
    return this._estimationWithdrawn;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency injections ---
    this.errorHandlerSvc = inject(ErrorHandlerService);

    // --- Initialize signals ---
    this._cardSet = signal<CardSetDto | null>(null);
    this._clearEstimations = signal<number>(0);
    this._endHandshake = signal<number>(0);
    this._sessionEnded = signal<SessionEndedDto | null>(null);
    this._estimationList = signal<Array<EstimationDto>>(new Array<EstimationDto>());
    this._startHandshake = signal<ParticipantDto | null>(null);
    this._participantChanged = signal<ParticipantChangeDto | null>(null);
    this._participantList = signal<Array<ParticipantDto>>(new Array<ParticipantDto>());
    this._ping = signal<number>(0);
    this._gameStateChanged = signal<GameStateChangedDto>({ state: EGameState.Cleared });
    this._self = signal<ParticipantDto | null>(null);
    this._team = signal<TeamDto | null>(null);
    this._estimationWithdrawn = signal<EstimationWithdrawnDto | null>(null);
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
      case EServerMessageType.Team:
        this._team.set((<TeamMessageDto>message).data);
        break;
      case EServerMessageType.EstimationWithdrawn:
        this._estimationWithdrawn.set((<EstimationWithdrawnMessageDto>message).data);
    }

    return canContinue;
  }
  //#endregion
}
