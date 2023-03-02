import { inject, injectable } from "inversify";

import SERVICETYPES from "../service.types";

import { AServerMessage, EErrorCode, EMemberStatusChange, EPokerStatus, ICardSet, IEstimation, IMemberStatusChange, IParticipant } from "../../../../shared-lib/src";
import { CardSetMessage, ClearEstimationsMessage, EndSessionMessage, ErrorMessage, EstimationListMessage, InitMessage, LeftMessage, MemberChangedMessage, MemberListMessage, PingMessage, PokerStatusChangedMessage, SelfMessage, ServerResetMessage, TeamIdleMessage, TeamNameMessage } from "../../messages";
import { ITeam, IServerParticipant } from "../../objects";
import { IMessageService, ISenderService } from "../interfaces";
import { IWebSocket } from "../websocket";

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
  public broadcastAllEstimations(members: Array<IServerParticipant>, estimations: Array<IEstimation>, teamStatus: EPokerStatus): void {
    members.forEach((p: IServerParticipant) => this.sendEstimations(p, teamStatus === EPokerStatus.Revealed, estimations));
  }

  public broadcastCardSet(members: Array<IServerParticipant>, cardSet: ICardSet): void {
    members.forEach((p: IServerParticipant) => this.sendCardSet(p, cardSet));
  }

  public broadcastClearEstimations(members: Array<IServerParticipant>): void {
    members.forEach((p: IServerParticipant) => this.sendClearEstimations(p));
  }

  public broadcastEstimation(members: Array<IServerParticipant>, estimation: IEstimation, teamStatus: EPokerStatus): void {
    members.forEach((p: IServerParticipant) => this.sendEstimations(p, teamStatus === EPokerStatus.Revealed, [estimation]));
  }

  public broadcastPokerStatus(members: Array<IServerParticipant>, status: EPokerStatus): void {
    members.forEach((p: IServerParticipant) => this.sendPokerStatusChanged(p, status));
  }

  public broadcastMemberChange(members: Array<IServerParticipant>, changedMember: IServerParticipant, change: EMemberStatusChange): void {
    members.forEach((p: IServerParticipant) => this.sendMemberChange(p, changedMember, change));
  }

  public broadcastSessionEnded(members: Array<IServerParticipant>): void {
    members.forEach((p: IServerParticipant) => this.sendSessionEnded(p));
  }

  public broadcastTeamIdle(members: Array<IServerParticipant>): void {
    members.forEach((p: IServerParticipant) => this.sendTeamIdleMessage(p));
  }
  //#endregion

  //#region IMessageService send message methods ------------------------------
  public sendErrorMessageToParticipant(to: IServerParticipant, code: EErrorCode): void {
    const message: AServerMessage = new ErrorMessage(code);
    this.senderService.sendToParticipant(to, message);
  }

  public sendErrorMessageToSocket(ws: IWebSocket, code: EErrorCode): void {
    const message: AServerMessage = new ErrorMessage(code);
    this.senderService.sendToSocket(ws, message);
  }

  public sendInit(to: IServerParticipant): void {
    const message: AServerMessage = new InitMessage(this.prepareParticipantsData([to])[0]);
    this.senderService.sendToParticipant(to, message);
  }

  public sendLeft(to: IServerParticipant): void {
    const message: AServerMessage = new LeftMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendPing(to: IServerParticipant): void {
    const message: AServerMessage = new PingMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendReset(to: IServerParticipant): void {
    const message: AServerMessage = new ServerResetMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendSelf(to: IServerParticipant): void {
    const message: AServerMessage = new SelfMessage(to.self);
    this.senderService.sendToParticipant(to, message);
  }

  public sendAllInfo(to: IServerParticipant, team: ITeam, members: Array<IServerParticipant>, cardSet: ICardSet, estimations: Array<IEstimation>): void {
    let message: AServerMessage = new SelfMessage(this.prepareParticipantsData([to])[0])
    this.senderService.sendToParticipant(to, message);
    message = new TeamNameMessage(team.teamName);
    this.senderService.sendToParticipant(to, message);
    message = new CardSetMessage(cardSet);
    this.senderService.sendToParticipant(to, message);
    message = new MemberListMessage(members.map((p: IServerParticipant) => p.self));
    this.senderService.sendToParticipant(to, message);
    message = new EstimationListMessage(estimations);
    this.senderService.sendToParticipant(to, message);
  }

  public sendException(socket: IWebSocket, errorMessage: string): void {
    const message: AServerMessage = new ErrorMessage(EErrorCode.ServerError, errorMessage);
    this.senderService.sendToSocket(socket, message);
  }
  //#endregion

  //#region private send methods ----------------------------------------------
  private sendCardSet(to: IServerParticipant, cardSet: ICardSet): void {
    const message: AServerMessage = new CardSetMessage(cardSet);
    this.senderService.sendToParticipant(to, message);
  }

  private sendClearEstimations(to: IServerParticipant): void {
    const message: AServerMessage = new ClearEstimationsMessage();
    this.senderService.sendToParticipant(to, message);
  }

  private sendEstimations(to: IServerParticipant, revealed: boolean, estimations: Array<IEstimation>): void {
    const message: AServerMessage = new EstimationListMessage(estimations);
    this.senderService.sendToParticipant(to, message);
  }

  private sendMemberChange(to: IServerParticipant, changedMember: IServerParticipant, change: EMemberStatusChange) {
    const data: IMemberStatusChange = {
      memberStatusChange: change,
      member: {
        status: changedMember.status,
        nick: changedMember.nick,
        participantId: changedMember.participantId,
        role: changedMember.role,
        observer: changedMember.observer
      }
    }
    const message: AServerMessage = new MemberChangedMessage(data);
    this.senderService.sendToParticipant(to, message);
  }

  private sendPokerStatusChanged(to: IServerParticipant, status: EPokerStatus): void {
    const message: AServerMessage = new PokerStatusChangedMessage(status);
    this.senderService.sendToParticipant(to, message);
  }

  public sendSessionEnded(to: IServerParticipant): void {
    const message: AServerMessage = new EndSessionMessage();
    this.senderService.sendToParticipant(to, message);
  }

  private sendTeamIdleMessage(to: IServerParticipant): void {
    const message: AServerMessage = new TeamIdleMessage();
    this.senderService.sendToParticipant(to, message);
  }

  //#endregion

  //#region Private prepare message data methods ------------------------------
  private prepareParticipantsData(participants: Array<IServerParticipant>): Array<IParticipant> {
    return participants.map(participant => {
      return {
        status: participant.status,
        nick: participant.nick,
        participantId: participant.participantId,
        role: participant.role,
        observer: participant.observer
      };
    });
  }
  //#endregion
}