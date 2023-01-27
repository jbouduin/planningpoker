import { Injectable } from '@angular/core';
import { ConnectionService } from '@app/@shared';
import { EPokerStatus, EServerMessageType, IEstimation, IEstimationsMessage, IInitMessage, IPokerStatusChangedMessage, ISelfMessage, ServerMessage } from '@shared-lib';
import { EstimateMessage, RevealMessage, StartMessage } from '../messages';
import { Estimation, Member } from '../objects';
import { CardService } from './card.service';
import { TeamService } from './team.service';

@Injectable({
  providedIn: 'root'
})
export class PokerService {
  //#region private properties ------------------------------------------------
  private readonly cardService: CardService;
  private readonly connectionService: ConnectionService;
  private readonly teamService: TeamService;
  private myUuid: string;
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
          .filter((m: Member) => !this.givenEstimations.has(m.uuid))
          .sort((a: Member, b: Member) => a.nick.localeCompare(b.nick));
        break;
    }
    return result;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(cardService: CardService, connectionService: ConnectionService, teamService: TeamService) {
    this.cardService = cardService;
    this.connectionService = connectionService;
    this.teamService = teamService;
    this.givenEstimations = new Map<string, Estimation>;
    this.myUuid = '';
    this.pokerStatus = EPokerStatus.Cleared;
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case EServerMessageType.Init:
        this.myUuid = (<IInitMessage>message).data.uuid;
        break;
      case EServerMessageType.Self:
        this.myUuid = (<ISelfMessage>message).data.uuid;
        break;
      case EServerMessageType.ClearEstimations:
        this.givenEstimations.clear();
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.Reset:
        this.givenEstimations.clear();
        this.pokerStatus = EPokerStatus.Cleared;
        break;
      case EServerMessageType.EstimationList:
        this.handleEstimations((<IEstimationsMessage>message).data);
        break;
      case EServerMessageType.PokerStatus:
        this.pokerStatus = (<IPokerStatusChangedMessage>message).data;
        break;
    }
  }

  public withDraw(): void {
    console.log('withdrawing estimation');
    const message = new EstimateMessage(this.myUuid, -1);
    this.connectionService.sendMessage(message);
  }

  public estimate(index: number): void {
    console.log(`estimated ${index}`);
    const message = new EstimateMessage(this.myUuid, index);
    this.connectionService.sendMessage(message);
  }

  public reveal(): void {
    console.log('reveal');
    // TODO this should work without teamname
    const message = new RevealMessage(this.myUuid, this.teamService.teamName);
    this.connectionService.sendMessage(message);
  }

  public start(): void {
    console.log('starting');
    // TODO this should work without teamname
    const message = new StartMessage(this.myUuid, this.teamService.teamName);
    this.connectionService.sendMessage(message);
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private handleEstimations(estimations: Array<IEstimation>): void {
    estimations.forEach(estimation => {
      if (estimation.card >= 0) {
        const member = this.teamService.getMember(estimation.participantUuid);
        const card = this.cardService.getCard(estimation.card);
        if (member && card) {
          this.givenEstimations.set(estimation.participantUuid, new Estimation(member, card, estimation.revealed));
        }
      } else {
        console.log(`Removing estimation '${estimation.participantUuid}'`);
        this.givenEstimations.delete(estimation.participantUuid);
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
  // private handlePokerStatus(status: EPokerStatus): void {

  //   switch (status) {
  //     case EPokerStatus.Cleared:
  //       this.givenEstimations.clear();
  //       this.givenEstimations.clear();
  //       break;
  //     case EPokerStatus.Revealed:
  //       for (const estimation of this.givenEstimations) {
  //         estimation.re
  //       }
  //       break;
  //     case EPokerStatus.Started:
  //       // this.membersWithoutEstimation = this.teamService.allMembers.filter((member: Member) => !member.observer);
  //     }
  //     this.pokerStatus = status;
  // }
}
