import { inject, injectable } from "inversify";

import SERVICETYPES from "../service.types";

import { ECardSet, EErrorCode, EMemberStatusChange, EParticipantStatus, EPokerStatus, IEstimation, IMemberStatusChange, IParticipant, ServerMessage } from "../../../../shared-lib/lib";
import { CardSetMessage, ClearEstimationsMessage, EndSessionMessage, ErrorMessage, EstimationListMessage, InitMessage, LeftMessage, MemberChangedMessage, MemberListMessage, PingMessage, PokerStatusChangedMessage, SelfMessage, ServerResetMessage, TeamNameMessage } from "../../messages";
import { Estimation, ITeam, Participant } from "../../objects";
import { ICardService, IMessageService, ISenderService } from "../interfaces";
import { IWebSocket } from "../websocket";

@injectable()
export class MessageService implements IMessageService {

  //#region private properties ------------------------------------------------
  private readonly cardService: ICardService;
  private readonly senderService: ISenderService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.CardService) cardService: ICardService,
    @inject(SERVICETYPES.SenderService) senderService: ISenderService) {
    this.cardService = cardService;
    this.senderService = senderService;
  }
  //#endregion

  //#region IMessageService broadcast methods ---------------------------------
  public broadcastAllEstimations(team: ITeam): void {
    team
      .filterMembers(participant => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, team.status === EPokerStatus.Revealed, team.allEstimations));
  }

  public broadcastClearEstimations(team: ITeam): void {
    team
      .filterMembers(participant => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.sendClearEstimations(participant));
  }

  public broadcastEstimation(team: ITeam, estimation: Estimation): void {
    team
      .filterMembers(participant => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.sendEstimations(participant, team.status === EPokerStatus.Revealed, [estimation]));
  }

  public broadcastPokerStatus(team: ITeam): void {
    team
      .filterMembers(participant => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.sendPokerStatusChanged(participant, team));
  }

  public broadcastMemberChange(team: ITeam, changedMember: Participant, change: EMemberStatusChange): void {
    team
      .filterMembers(other => other.uuid !== changedMember.uuid && other.status === EParticipantStatus.Connected)
      .forEach(other => this.sendMemberChange(other, changedMember, change));
  }

  public broadcastSessionEnded(team: ITeam, participant: Participant): void {
    team
      .filterMembers(other => other.uuid !== participant.uuid && other.status === EParticipantStatus.Connected)
      .forEach(other => this.sendSessionEnded(other));
  }
  //#endregion

  //#region IMessageService send message methods ------------------------------
  public sendSessionEnded(to: Participant): void {
    const message: ServerMessage = new EndSessionMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendErrorMessageToParticipant(to: Participant, code: EErrorCode): void {
    const message: ServerMessage = new ErrorMessage(code);
    this.senderService.sendToParticipant(to, message);
  }

  public sendErrorMessageToSocket(ws: IWebSocket, code: EErrorCode): void {
    const message: ServerMessage = new ErrorMessage(code);
    this.senderService.sendToSocket(ws, message);
  }

  public sendInit(to: Participant): void {
    const message: ServerMessage = new InitMessage(this.prepareParticipantsData([to])[0]);
    this.senderService.sendToParticipant(to, message);
  }

  public sendLeft(to: Participant): void {
    const message: ServerMessage = new LeftMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendPing(to: Participant): void {
    const message: ServerMessage = new PingMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendReset(to: Participant): void {
    const message: ServerMessage = new ServerResetMessage();
    this.senderService.sendToParticipant(to, message);
  }

  public sendSelf(to: Participant): void {
    const message: ServerMessage = new SelfMessage(this.prepareParticipantsData([to])[0]);
    this.senderService.sendToParticipant(to, message);
  }

  public sendTeamInfo(to: Participant, game: ITeam): void {
    let message: ServerMessage = new SelfMessage(this.prepareParticipantsData([to])[0])
    this.senderService.sendToParticipant(to, message);
    message = new TeamNameMessage(game.teamName);
    this.senderService.sendToParticipant(to, message);
    message = new CardSetMessage(this.cardService.getCardSet(ECardSet.Cohn));
    this.senderService.sendToParticipant(to, message);
    message = new MemberListMessage(this.prepareParticipantsData(game.filterMembers(other => other.uuid !== to.uuid)));
    this.senderService.sendToParticipant(to, message);
    message = new EstimationListMessage(this.prepareEstimationsData(to, game.status === EPokerStatus.Revealed, game.allEstimations));
    this.senderService.sendToParticipant(to, message);
  }

  public sendException(socket: IWebSocket, errorMessage: string): void {
    const message: ServerMessage = new ErrorMessage(EErrorCode.ServerError, errorMessage);
    this.senderService.sendToSocket(socket, message);
  }

  //#region private send methods ----------------------------------------------
  private sendClearEstimations(to: Participant): void {
    const message: ServerMessage = new ClearEstimationsMessage();
    this.senderService.sendToParticipant(to, message);
  }

  private sendEstimations(to: Participant, revealed: boolean, estimations: Array<Estimation>): void {
    const message: ServerMessage = new EstimationListMessage(this.prepareEstimationsData(to, revealed, estimations));
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
    const message: ServerMessage = new MemberChangedMessage(data);
    this.senderService.sendToParticipant(to, message);
  }

  private sendPokerStatusChanged(to: Participant, game: ITeam): void {
    const message: ServerMessage = new PokerStatusChangedMessage(game.status);
    this.senderService.sendToParticipant(to, message);
  }
  //#endregion

  //#region Private prepare message data methods ------------------------------
  private prepareEstimationsData(to: Participant, revealed: boolean, estimations: Array<Estimation>): Array<IEstimation> {
    return estimations.map(estimation => {
      return {
        card: estimation.card < 0 ?
          estimation.card :
          revealed || estimation.participantUuid === to.uuid ? estimation.card : 0,
        revealed: revealed || estimation.participantUuid === to.uuid,
        participantUuid: estimation.participantUuid
      };
    });
  }

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