import { effect, inject, Service, signal, WritableSignal } from '@angular/core';
import { EPokerStatus, ICard, IEstimation, IParticipant } from 'shared-lib';
import { Member, MessageDispatcherService, SessionService, SocketService } from '../../../core';
import { EstimateMessage, RevealMessage, StartMessage } from '../../../shared/dto';
import { TeamService } from '../../team/services';
import { Estimation } from './estimation';
import { GameService } from './game.service';

@Service()
export class PokerService {
  //#region private readonly fields -------------------------------------------
  private readonly gameSvc: GameService;
  private readonly sessionSvc: SessionService;
  private readonly socketSvc: SocketService;
  private readonly teamSvc: TeamService;
  //#endregion

  //#region Private Fields ----------------------------------------------------
  private myParticipantId: string | null;
  //#endregion

  //#region Signals -----------------------------------------------------------
  public readonly pokerState: WritableSignal<EPokerStatus>;
  public readonly estimations: WritableSignal<Array<Estimation>>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // Inject other services
    this.gameSvc = inject(GameService);
    this.sessionSvc = inject(SessionService);
    this.socketSvc = inject(SocketService);
    this.teamSvc = inject(TeamService);
    // Initialize service signals
    this.pokerState = signal(EPokerStatus.Cleared);
    this.estimations = signal<Array<Estimation>>(new Array<Estimation>());
    // Initialize private fields
    this.myParticipantId = null;
    // register message handlers
    const dispatcherSvc = inject(MessageDispatcherService);
    this.registerMessageHandlers(dispatcherSvc);
  }

  private registerMessageHandlers(_dispatcherSvc: MessageDispatcherService): void {
    const adapterSvc = inject(MessageDispatcherService);
    // effect(() => {
    //   if (adapterSvc.clearEstimations()) {
    //     this.estimations.set(new Array<Estimation>());
    //   }
    // });
    effect(() => {
      if (adapterSvc.endSession()) {
        this.resetService();
      }
    });
    effect(() => {
      if (adapterSvc.serverReset()) {
        this.resetService();
      }
    });
    effect(() => {
      if (adapterSvc.teamIdle()) {
        this.resetService();
      }
    });
    // effect(() => {
    //   this.calculateEstimationList(adapterSvc.estimationList(), this.getAllMembers());
    // });
    // effect(() => {
    //   this.handlePokerState(adapterSvc.pokerStatus());
    // });
    // effect(() => {
    //   const me = this.sessionSvc.me();
    //   if (me != null) {
    //     this.myParticipantId = me.participantId;
    //   } else {
    //     this.myParticipantId = null;
    //   }
    // });
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public withDraw(): void {
    if (this.myParticipantId !== null) {
      const message = new EstimateMessage(this.myParticipantId, -1);
      this.socketSvc.sendMessage(message);
    }
    // TODO else error
  }

  public estimate(index: number): void {
    if (this.myParticipantId !== null) {
      const message = new EstimateMessage(this.myParticipantId, index);
      this.socketSvc.sendMessage(message);
    }
    // TODO else error
  }

  public reveal(): void {
    if (this.myParticipantId !== null) {
      const message = new RevealMessage(this.myParticipantId);
      this.socketSvc.sendMessage(message);
    }
    // TODO else error
  }

  public start(): void {
    if (this.myParticipantId !== null) {
      const message = new StartMessage(this.myParticipantId);
      this.socketSvc.sendMessage(message);
    }
    // TODO else error
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handlePokerState(data: EPokerStatus): void {
    this.pokerState.set(data);
    // todo rebuild the list of estimations.
    switch (data) {
      case EPokerStatus.Cleared:
        // this.calculateEstimationList(new Array<IEstimation>(), this.getAllMembers());
        break;
      case EPokerStatus.Started:
        // TODO check what this does when rejoining
        // this.calculateEstimationList(new Array<IEstimation>(), this.getAllMembers());
        break;
      case EPokerStatus.Revealed:
        // TODO: switch estimations revealed flag → apparently not required
        break;
    }
  }

  private resetService(): void {
    this.pokerState.set(EPokerStatus.Cleared);
    this.estimations.set(new Array<Estimation>());
  }

  private calculateEstimationList(estimationList: Array<IEstimation>, allMembers: Array<Member>): void {
    let result: Array<Estimation>;
    const pokerState = this.pokerState();
    // console.log('build estimation list -> state', pokerState);
    // console.log('build estimation list -> estimations', estimationList);
    // console.log('build estimation list -> all members', allMembers);
    const cards = this.gameSvc.cards();
    if (pokerState !== EPokerStatus.Cleared && cards != null) {
      // TODO use only non-observers, and participants that are online
      result = allMembers.map((member: Member) => {
        const givenEstimation = estimationList.find((e: IEstimation) => e.participantId === member.participantId);
        const card = givenEstimation ? cards.find((c: ICard) => c.index === givenEstimation.cardIndex) || null : null;
        return new Estimation(member, card, pokerState === EPokerStatus.Revealed || member.me);
      });
      result = this.sortEstimations(pokerState, result);
    } else {
      result = new Array<Estimation>();
    }
    // console.log('build estimation list -> result', result);
    this.estimations.set(result);
  }

  private getAllMembers(): Array<Member> {
    const me = this.sessionSvc.me();
    const others = this.teamSvc.members().map((p: IParticipant) => new Member(p, false));
    return me ? [me, ...others] : others;
  }

  /**
   * Sort the estimations.
   *
   * - If `pokerState == EPokerState.Started` then:
   *   - put my estimation in front
   *   - followed by estimations that have a card, ordered by nickname
   *   - followed by estimations with no card, ordered by nickname
   * - If `pokerState == EPokerState.Revelad` then order by card index, by nickname
   *
   * @param pokerState
   * @param estimations
   */
  private sortEstimations(pokerState: EPokerStatus, estimations: Array<Estimation>): Array<Estimation> {
    let result = new Array<Estimation>();
    if (pokerState === EPokerStatus.Started) {
      const myEstimation = estimations.find((e: Estimation) => e.member.me);
      const estimationsWithValue = estimations
        .filter((e: Estimation) => e.card !== null && !e.member.me)
        .sort((a: Estimation, b: Estimation) => a.member.nick.localeCompare(b.member.nick));
      const estimationsWithoutValue = estimations.filter((e: Estimation) => e.card === null && !e.member.me);
      result = myEstimation
        ? [myEstimation, ...estimationsWithValue, ...estimationsWithoutValue]
        : [...estimationsWithValue, ...estimationsWithoutValue];
    } else {
      result = estimations.sort((a: Estimation, b: Estimation) => {
        let compared = (a.card?.index || 0) - (b.card?.index || 0);
        if (compared == 0) {
          compared = a.member.nick.localeCompare(b.member.nick);
        }
        return compared;
      });
    }
    return result;
  }
  //#endregion
}
