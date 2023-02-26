import { inject, injectable } from "inversify";

import SERVICETYPES from "../service.types";

import { AServerMessage, EErrorCode, EMemberStatusChange, EParticipantStatus, EPokerStatus, ICardSet, IEstimation, IMemberStatusChange, IParticipant } from "../../../../shared-lib/src";
import { CardSetMessage, ClearEstimationsMessage, EndSessionMessage, ErrorMessage, EstimationListMessage, InitMessage, LeftMessage, MemberChangedMessage, MemberListMessage, PingMessage, PokerStatusChangedMessage, SelfMessage, ServerResetMessage, TeamIdleMessage, TeamNameMessage } from "../../messages";
import { Estimation, ITeam, Participant } from "../../objects";
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
  public broadcastAllEstimations(members: Array<Participant>, estimations: Array<Estimation>, teamStatus: EPokerStatus): void {
    members
      .filter((p: Participant) => p.status === EParticipantStatus.Connected)
      .forEach((p: Participant) => this.sendEstimations(p, teamStatus === EPokerStatus.Revealed, estimations));
  }

  public broadcastCardSet(members: Array<Participant>, cardSet: ICardSet): void {
    members
      .filter((p: Participant) => p.status === EParticipantStatus.Connected)
      .forEach((p: Participant) => this.sendCardSet(p, cardSet));
  }

  public broadcastClearEstimations(members: Array<Participant>): void {
    members
      .filter((p: Participant) => p.status === EParticipantStatus.Connected)
      .forEach((p: Participant) => this.sendClearEstimations(p));
  }

  public broadcastEstimation(members: Array<Participant>, estimation: Estimation, teamStatus: EPokerStatus): void {
    members
      .filter((p: Participant) => p.status === EParticipantStatus.Connected)
      .forEach((p: Participant) => this.sendEstimations(p, teamStatus === EPokerStatus.Revealed, [estimation]));
  }

  public broadcastPokerStatus(members: Array<Participant>, status: EPokerStatus): void {
    members
      .filter((p: Participant) => p.status === EParticipantStatus.Connected)
      .forEach((p: Participant) => this.sendPokerStatusChanged(p, status));
  }

  public broadcastMemberChange(members: Array<Participant>, changedMember: Participant, change: EMemberStatusChange): void {
    members
      .filter((p: Participant) => p.status === EParticipantStatus.Connected)
      .forEach(other => this.sendMemberChange(other, changedMember, change));
  }

  public broadcastSessionEnded(members: Array<Participant>): void {
    members
      .filter((p: Participant) => p.status === EParticipantStatus.Connected)
      .forEach(other => this.sendSessionEnded(other));
  }
  //#endregion

  //#region IMessageService send message methods ------------------------------
  public sendSessionEnded(to: Participant): void {
    const message: AServerMessage = new EndSessionMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendErrorMessageToParticipant(to: Participant, code: EErrorCode): void {
    const message: AServerMessage = new ErrorMessage(code);
    this.senderService.sendToParticipant(to, message);
  }

  public sendErrorMessageToSocket(ws: IWebSocket, code: EErrorCode): void {
    const message: AServerMessage = new ErrorMessage(code);
    this.senderService.sendToSocket(ws, message);
  }

  public sendInit(to: Participant): void {
    const message: AServerMessage = new InitMessage(this.prepareParticipantsData([to])[0]);
    this.senderService.sendToParticipant(to, message);
  }

  public sendLeft(to: Participant): void {
    const message: AServerMessage = new LeftMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendPing(to: Participant): void {
    const message: AServerMessage = new PingMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendReset(to: Participant): void {
    const message: AServerMessage = new ServerResetMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendSelf(to: Participant): void {
    const message: AServerMessage = new SelfMessage(this.prepareParticipantsData([to])[0]);
    this.senderService.sendToParticipant(to, message);
  }

  public sendTeamIdleMessage(to: Participant): void {
    const message: AServerMessage = new TeamIdleMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendAllInfo(to: Participant, team: ITeam, members: Array<Participant>, cardSet: ICardSet, estimations: Array<Estimation>): void {
    let message: AServerMessage = new SelfMessage(this.prepareParticipantsData([to])[0])
    this.senderService.sendToParticipant(to, message);
    message = new TeamNameMessage(team.teamName);
    this.senderService.sendToParticipant(to, message);
    message = new CardSetMessage(cardSet);
    this.senderService.sendToParticipant(to, message);
    message = new MemberListMessage(this.prepareParticipantsData(members));
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
  private sendCardSet(to: Participant, cardSet: ICardSet): void {
    const message: AServerMessage = new CardSetMessage(cardSet);
    this.senderService.sendToParticipant(to, message);
  }

  private sendClearEstimations(to: Participant): void {
    const message: AServerMessage = new ClearEstimationsMessage();
    this.senderService.sendToParticipant(to, message);
  }

  private sendEstimations(to: Participant, revealed: boolean, estimations: Array<Estimation>): void {
    const message: AServerMessage = new EstimationListMessage(estimations);
    this.senderService.sendToParticipant(to, message);
  }

  private sendMemberChange(to: Participant, changedMember: Participant, change: EMemberStatusChange) {
    const data: IMemberStatusChange = {
      memberStatusChange: change,
      member: {
        status: changedMember.status,
        nick: changedMember.nick,
        uuid: changedMember.uuid,
        role: changedMember.role,
        observer: changedMember.observer
      }
    }
    const message: AServerMessage = new MemberChangedMessage(data);
    this.senderService.sendToParticipant(to, message);
  }

  private sendPokerStatusChanged(to: Participant, status: EPokerStatus): void {
    const message: AServerMessage = new PokerStatusChangedMessage(status);
    this.senderService.sendToParticipant(to, message);
  }
  //#endregion

  //#region Private prepare message data methods ------------------------------
  private prepareParticipantsData(participants: Array<Participant>): Array<IParticipant> {
    return participants.map(participant => {
      return {
        status: participant.status,
        nick: participant.nick,
        uuid: participant.uuid,
        role: participant.role,
        observer: participant.observer
      };
    });
  }
  //#endregion
}