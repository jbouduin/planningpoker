import { Injectable } from '@angular/core';

import { EPokerStatus, EServerMessageType, IEstimation, IEstimationListMessage, IInitMessage, IPokerStatusChangedMessage, AServerMessage } from '@shared-lib';

import { EstimateMessage, RevealMessage, StartMessage } from '@shared/messages';
import { Member, SessionService } from '@shared/services';
import { CardService } from './card.service';
import { Estimation } from './estimation';
import { TeamService } from './team.service';

@Injectable({
  providedIn: 'root'
})
export class PokerService {
  //#region private properties ------------------------------------------------
  private readonly cardService: CardService;
  private readonly sessionService: SessionService;
  private readonly teamService: TeamService;
  private myParticipantId: string;
  private pokerStatus: EPokerStatus;
  private givenEstimations: Map<string, Estimation>;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get estimations(): Array<Estimation> {
    return this.createEstimationsArray();
  }

  public get canPoker(): boolean {
    return this.pokerStatus == EPokerStatus.Started;
  }

  public get membersWithoutEstimation(): Array<Member> {
    let result: Array<Member>;
    switch (this.pokerStatus){
      case EPokerStatus.Cleared:
      case EPokerStatus.Revealed:
        result = new Array<Member>();
        break;
      default:
        result = this.teamService.estimatingMembers
          .filter((m: Member) => !this.givenEstimations.has(m.participantId))
          .sort((a: Member, b: Member) => a.nick.localeCompare(b.nick));
        break;
    }
    return result;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(cardService: CardService, sessionService: SessionService, teamService: TeamService) {
    this.cardService = cardService;
    this.sessionService = sessionService;
    this.teamService = teamService;
    this.givenEstimations = new Map<string, Estimation>;
    this.myParticipantId = '';
    this.pokerStatus = EPokerStatus.Cleared;
    this.sessionService.incomingMessage.subscribe((serverMessage: AServerMessage) => this.handleServerMessage(serverMessage));
    this.sessionService.reset.subscribe(() => this.resetService());
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public handleServerMessage(message: AServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Init:
      case EServerMessageType.Self:
        this.myParticipantId = (<IInitMessage>message).data.participantId;
        break;
      case EServerMessageType.ClearEstimations:
        this.givenEstimations.clear();
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.ServerReset:
      case EServerMessageType.TeamIdle:
        this.resetService();
        break;
      case EServerMessageType.EstimationList:
        this.handleEstimations((<IEstimationListMessage>message).data);
        break;
      case EServerMessageType.PokerStatus:
        this.pokerStatus = (<IPokerStatusChangedMessage>message).data;
        break;
    }
  }

  public withDraw(): void {
    const message = new EstimateMessage(this.myParticipantId, -1);
    this.sessionService.sendMessage(message);
  }

  public estimate(index: number): void {
    const message = new EstimateMessage(this.myParticipantId, index);
    this.sessionService.sendMessage(message);
  }

  public reveal(): void {
    const message = new RevealMessage(this.myParticipantId);
    this.sessionService.sendMessage(message);
  }

  public start(): void {
    const message = new StartMessage(this.myParticipantId);
    this.sessionService.sendMessage(message);
  }

  private resetService(): void {
    this.givenEstimations.clear();
    this.pokerStatus = EPokerStatus.Cleared;
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private handleEstimations(estimations: Array<IEstimation>): void {
    estimations.forEach(estimation => {
      if (estimation.cardIndex >= 0) {
        const member = this.teamService.getMember(estimation.participantId);
        const card = this.cardService.getCard(estimation.cardIndex);
        if (member && card) {
          this.givenEstimations.set(estimation.participantId, new Estimation(member, card, estimation.revealed));
        }
      } else {
        this.givenEstimations.delete(estimation.participantId);
      }
    });
  }

  private createEstimationsArray(): Array<Estimation> {
    let result: Array<Estimation>;
    let myEstimation: Estimation | undefined;
    const given = Array.from(this.givenEstimations.values());
    switch (this.pokerStatus) {
      case EPokerStatus.Revealed:
        result = given;
        result.sort((a: Estimation, b: Estimation) => a.card.index - b.card.index);
        break;
      case EPokerStatus.Started:
        result = given.filter((e: Estimation) => !e.member.me);
        result.sort((a: Estimation, b: Estimation) => a.member.nick.localeCompare(b.member.nick));
        myEstimation = given.find((e: Estimation) => e.member.me);
        if (myEstimation) {
          result.splice(0, 0, myEstimation);
        }
        break;
      default:
        result = new Array<Estimation>();
    }
    return result;
  }
}
