import { inject, injectable } from 'inversify';
import type { AServerMessage } from 'shared-lib';
import {
  CardSetDto,
  EErrorCode,
  EGameState,
  EParticipantChangeType,
  EstimationDto,
  ParticipantChangeDto,
  ParticipantDto
} from 'shared-lib';
import {
  CardSetMessage,
  ClearEstimationsMessage,
  EndInitMessage,
  EndSessionMessage,
  ErrorMessage,
  EstimationListMessage,
  EstimationWithdrawnMessage,
  GameStateChangedMessage,
  InitMessage,
  ParticipantChangedMessage,
  ParticipantListMessage,
  PingMessage,
  SelfMessage,
  ServerResetMessage,
  TeamIdleMessage,
  TeamNameMessage
} from '../../messages/index.js';
import type { IServerParticipant, IServerTeam } from '../../objects/interfaces/index.js';
import type { IMessageService, ISenderService } from '../interfaces/index.js';
import SERVICETYPES from '../service.types.js';
import { IWebSocket } from '../websocket.js';

@injectable()
export class MessageService implements IMessageService {
  //#region private properties ------------------------------------------------
  private readonly senderService: ISenderService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.SenderService) senderService: ISenderService) {
    this.senderService = senderService;
  }
  //#endregion

  //#region IMessageService broadcast methods ---------------------------------
  public broadcastCardSet(members: Array<IServerParticipant>, cardSet: CardSetDto): void {
    members.forEach((p: IServerParticipant) => this.sendCardSet(p, cardSet));
  }

  public broadcastClearEstimations(members: Array<IServerParticipant>): void {
    members.forEach((p: IServerParticipant) => this.sendClearEstimations(p));
  }

  public broadcastEstimations(
    gameState: EGameState,
    members: Array<IServerParticipant>,
    estimations: Array<EstimationDto>
  ): void {
    members.forEach((p: IServerParticipant) => this.sendEstimation(gameState, p, estimations));
  }

  public broadcastEstimationWithDrawn(members: Array<IServerParticipant>, participantId: string): void {
    members.forEach((p: IServerParticipant) => this.sendEstimationWithDrawn(p, participantId));
  }

  public broadcastGameState(members: Array<IServerParticipant>, gameState: EGameState): void {
    members.forEach((p: IServerParticipant) => this.sendGameStateChanged(p, gameState));
  }

  public broadcastMemberChange(
    members: Array<IServerParticipant>,
    changedMember: IServerParticipant,
    change: EParticipantChangeType
  ): void {
    members.forEach((p: IServerParticipant) => this.sendMemberChange(p, changedMember, change));
  }

  public broadcastReset(members: Array<IServerParticipant>): void {
    members.forEach((p: IServerParticipant) => this.sendReset(p));
  }

  public broadcastSessionEnded(members: Array<IServerParticipant>): void {
    members.forEach((p: IServerParticipant) => this.sendSessionEnded(p));
  }

  public broadcastTeamIdle(members: Array<IServerParticipant>): void {
    members.forEach((p: IServerParticipant) => this.sendTeamIdleMessage(p));
  }
  //#endregion

  //#region IMessageService send message methods ------------------------------
  public sendErrorMessageToSocket(ws: IWebSocket, code: EErrorCode): void {
    const message: AServerMessage = new ErrorMessage(code);
    this.senderService.sendToSocket(ws, message);
  }

  public sendEstimation(gameState: EGameState, to: IServerParticipant, estimations: Array<EstimationDto>): void {
    const transformed: Array<EstimationDto> = estimations.map((e: EstimationDto) => {
      return {
        participantId: e.participantId,
        cardIndex: gameState == EGameState.Revealed || e.participantId === to.participantId ? e.cardIndex : null
      };
    });
    const message: AServerMessage = new EstimationListMessage(transformed);
    this.senderService.sendToParticipant(to, message);
  }

  public sendGameStateChanged(to: IServerParticipant, gameState: EGameState): void {
    const message: AServerMessage = new GameStateChangedMessage(gameState);
    this.senderService.sendToParticipant(to, message);
  }

  public sendInit(to: IServerParticipant): void {
    const message: AServerMessage = new InitMessage(this.prepareParticipantsData([to])[0]);
    this.senderService.sendToParticipant(to, message);
  }

  public sendPing(to: IServerParticipant): void {
    const message: AServerMessage = new PingMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendSelf(to: IServerParticipant): void {
    const message: AServerMessage = new SelfMessage(to.self);
    this.senderService.sendToParticipant(to, message);
  }

  public sendInitSequence(
    to: IServerParticipant,
    team: IServerTeam,
    members: Array<IServerParticipant>,
    cardSet: CardSetDto
  ): void {
    let message: AServerMessage = new SelfMessage(this.prepareParticipantsData([to])[0]);
    this.senderService.sendToParticipant(to, message);
    message = new TeamNameMessage(team.teamName);
    this.senderService.sendToParticipant(to, message);
    message = new CardSetMessage(cardSet);
    this.senderService.sendToParticipant(to, message);
    message = new ParticipantListMessage(members.map((p: IServerParticipant) => p.self));
    this.senderService.sendToParticipant(to, message);
    message = new EndInitMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendException(socket: IWebSocket, errorMessage: string): void {
    const message: AServerMessage = new ErrorMessage(EErrorCode.ServerError, errorMessage);
    this.senderService.sendToSocket(socket, message);
  }
  //#endregion

  //#region private send methods ----------------------------------------------
  private sendCardSet(to: IServerParticipant, cardSet: CardSetDto): void {
    const message: AServerMessage = new CardSetMessage(cardSet);
    this.senderService.sendToParticipant(to, message);
  }

  private sendEstimationWithDrawn(to: IServerParticipant, participantId: string): void {
    const message: AServerMessage = new EstimationWithdrawnMessage(participantId);
    this.senderService.sendToParticipant(to, message);
  }

  private sendClearEstimations(to: IServerParticipant): void {
    const message: AServerMessage = new ClearEstimationsMessage();
    this.senderService.sendToParticipant(to, message);
  }

  private sendMemberChange(
    to: IServerParticipant,
    changedMember: IServerParticipant,
    change: EParticipantChangeType
  ): void {
    const data: ParticipantChangeDto = {
      changeType: change,
      member: {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        state: changedMember.state,
        role: changedMember.role,
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        nick: changedMember.nick,
        participantId: changedMember.participantId,
        observer: changedMember.observer
      }
    };
    const message: AServerMessage = new ParticipantChangedMessage(data);
    this.senderService.sendToParticipant(to, message);
  }

  private sendReset(to: IServerParticipant): void {
    const message: AServerMessage = new ServerResetMessage();
    this.senderService.sendToParticipant(to, message);
  }

  private sendSessionEnded(to: IServerParticipant): void {
    const message: AServerMessage = new EndSessionMessage();
    this.senderService.sendToParticipant(to, message);
  }

  private sendTeamIdleMessage(to: IServerParticipant): void {
    const message: AServerMessage = new TeamIdleMessage();
    this.senderService.sendToParticipant(to, message);
  }

  //#endregion

  //#region Private prepare message data methods ------------------------------
  private prepareParticipantsData(participants: Array<IServerParticipant>): Array<ParticipantDto> {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    return participants.map((participant: IServerParticipant) => {
      return {
        state: participant.state,
        nick: participant.nick,
        participantId: participant.participantId,
        role: participant.role,
        observer: participant.observer
      };
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  }
  //#endregion
}
