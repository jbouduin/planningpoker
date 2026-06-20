import { injectable } from 'inversify';
import { v4 as Uuid } from 'uuid';

import { ECardSet, EParticipantStatus, ERole, ICard, ICardSet, IEstimation } from 'shared-lib';

import { Estimation, IServerParticipant, ITeam, ServerParticipant, Team } from '../../objects';
import { IWebSocket } from '../../services/websocket';
import { IFactoryService } from '../interfaces';

@injectable()
export class FactoryService implements IFactoryService {
  //#region private properties ------------------------------------------------
  private cnt: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.cnt = 0;
  }
  //#endregion

  //#region IFactoryService methods -------------------------------------------
  public createCardSet(set: ECardSet): ICardSet {
    let cards: Array<ICard>;
    switch (set) {
      case ECardSet.Fibonacci:
        cards = this.generateFibonacci();
        break;
      case ECardSet.TShirt:
        cards = this.generateShirts();
        break;
      case ECardSet.Cohn:
      default:
        cards = this.generateCohn();
        break;
    }
    return {
      cardSet: set,
      cards: cards
    };
  }

  public createEstimation(participantId: string, cardIndex: number | undefined): IEstimation {
    return new Estimation(participantId, cardIndex);
  }

  public createParticipant(socket: IWebSocket): IServerParticipant {
    return new ServerParticipant(
      {
        nick: `participant ${++this.cnt}`,
        participantId: Uuid(),
        role: ERole.Unknown,
        observer: false,
        status: EParticipantStatus.Connected
      },
      socket
    );
  }

  public createTeam(teamName: string): ITeam {
    return new Team(teamName);
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private generateCohn(): Array<ICard> {
    let idx = 0;
    return [
      { index: idx++, label: '0', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '0.5', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '1', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '2', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '3', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '5', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '8', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '13', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '20', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '40', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '100', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '1000', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '?', isIcon: false, isUnknownEstimation: true, isEstimation: false },
      { index: idx++, label: 'local_cafe', isIcon: true, isUnknownEstimation: false, isEstimation: false }
    ];
  }

  private generateFibonacci(): Array<ICard> {
    let idx = 0;
    return [
      { index: idx++, label: '0', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '1', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '2', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '3', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '5', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '8', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '13', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '21', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '34', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '55', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '89', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '144', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '?', isIcon: false, isUnknownEstimation: true, isEstimation: false },
      { index: idx++, label: 'local_cafe', isIcon: true, isUnknownEstimation: false, isEstimation: false }
    ];
  }

  private generateShirts(): Array<ICard> {
    let idx = 0;
    return [
      { index: idx++, label: '0', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'XXXS', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'XXS', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'XS', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'S', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'M', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'L', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'XL', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'XXL', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: 'XXXL', isIcon: false, isUnknownEstimation: false, isEstimation: true },
      { index: idx++, label: '?', isIcon: false, isUnknownEstimation: true, isEstimation: true },
      { index: idx++, label: 'local_cafe', isIcon: true, isUnknownEstimation: false, isEstimation: true }
    ];
  }
  //#endregion
}
