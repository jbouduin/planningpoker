import { injectable } from 'inversify';
import { CardDto, CardSetDto, ECardSetType, EParticipantState, ERole, EstimationDto } from 'shared-lib';
import { v4 as Uuid } from 'uuid';
import { ServerParticipant, ServerTeam } from '../../objects/implementation/index.js';
import type { IServerParticipant, IServerTeam } from '../../objects/interfaces/index.js';
import { IWebSocket } from '../../services/websocket.js';
import type { IFactoryService } from '../interfaces/index.js';

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
  public createCardSet(set: ECardSetType): CardSetDto {
    let cards: Array<CardDto>;
    switch (set) {
      case ECardSetType.Fibonacci:
        cards = this.generateFibonacci();
        break;
      case ECardSetType.TShirt:
        cards = this.generateShirts();
        break;
      case ECardSetType.Cohn:
      default:
        cards = this.generateCohn();
        break;
    }
    return {
      cardSet: set,
      cards: cards
    };
  }

  public createEstimation(participantId: string, cardIndex: number | null): EstimationDto {
    return {
      cardIndex: cardIndex,
      participantId: participantId
    };
  }

  public createParticipant(socket: IWebSocket): IServerParticipant {
    return new ServerParticipant(
      {
        nick: `participant ${++this.cnt}`,
        participantId: Uuid(),
        role: ERole.Unknown,
        observer: false,
        state: EParticipantState.Connected
      },
      socket
    );
  }

  public createTeam(teamName: string): IServerTeam {
    return new ServerTeam(Uuid(), teamName);
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private generateCohn(): Array<CardDto> {
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

  private generateFibonacci(): Array<CardDto> {
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

  private generateShirts(): Array<CardDto> {
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
