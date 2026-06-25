import { jest } from '@jest/globals';
import { CardSetDto, ECardSetType, EGameState, EParticipantState, ERole } from 'shared-lib';
import { IServerParticipant, IServerTeam, ServerParticipant } from '../../src/objects';
import { PreflightService } from '../../src/services/implementation';
import { IPreflightService } from '../../src/services/interfaces';
import { IWebSocket, ReadyState } from '../../src/services/websocket';

export class Util {
  public static participant1Name = 'participant1';
  public static getParticipant1(): IServerParticipant {
    return new ServerParticipant(
      {
        nick: Util.participant1Name,
        participantId: Util.participant1Name,
        role: ERole.Developer,
        state: EParticipantState.Connected,
        observer: false
      },
      this.getSocket()
    );
  }

  public static participant2Name = 'participant2';
  public static getParticipant2(): IServerParticipant {
    return new ServerParticipant(
      {
        nick: Util.participant2Name,
        participantId: Util.participant2Name,
        role: ERole.Developer,
        state: EParticipantState.Connected,
        observer: false
      },
      this.getSocket()
    );
  }

  public static scrummasterName = 'scrum-master';
  public static getScrummaster(): IServerParticipant {
    return new ServerParticipant(
      {
        nick: Util.scrummasterName,
        participantId: Util.scrummasterName,
        role: ERole.ScrumMaster,
        state: EParticipantState.Connected,
        observer: true
      },
      Util.getSocket()
    );
  }

  public static observerName1 = 'observer1';
  public static getObserver1(): IServerParticipant {
    return new ServerParticipant(
      {
        nick: Util.observerName1,
        participantId: Util.observerName1,
        role: ERole.Developer,
        state: EParticipantState.Connected,
        observer: true
      },
      Util.getSocket()
    );
  }

  public static observerName2 = 'observer2';
  public static getObserver2(): IServerParticipant {
    return new ServerParticipant(
      {
        nick: Util.observerName2,
        participantId: Util.observerName2,
        role: ERole.Developer,
        state: EParticipantState.Connected,
        observer: true
      },
      Util.getSocket()
    );
  }

  public static disconnectedName = 'disconnectName';
  public static getDisconnected(): IServerParticipant {
    return new ServerParticipant(
      {
        nick: Util.disconnectedName,
        participantId: Util.disconnectedName,
        role: ERole.Developer,
        state: EParticipantState.Disconnected,
        observer: true
      },
      this.getSocket()
    );
  }
  public static team1Name = 'team1';
  public static getTeam1(status = EGameState.Cleared): IServerTeam {
    return {
      teamName: Util.team1Name,
      lastAccessTime: Date.now(),
      gameState: status
    };
  }

  public static team2Name = 'team2';
  public static getTeam2(status = EGameState.Cleared): IServerTeam {
    return {
      teamName: Util.team2Name,
      lastAccessTime: Date.now(),
      gameState: status
    };
  }

  public static getPreflightService(): IPreflightService {
    return new PreflightService();
  }

  public static getCardSet(): CardSetDto {
    return {
      cardSet: ECardSetType.Cohn,
      cards: [
        { index: 1, label: '1', isIcon: false, isUnknownEstimation: false, isEstimation: true },
        { index: 2, label: '2', isIcon: false, isUnknownEstimation: false, isEstimation: true },
        { index: 9, label: '?', isIcon: false, isUnknownEstimation: true, isEstimation: false }
      ]
    };
  }

  public static getSocket(): IWebSocket {
    return {
      readyState: ReadyState.OPEN,
      close: jest.fn(undefined),
      send: jest.fn(undefined)
    };
  }
}
