import { jest } from '@jest/globals';

import { ECardSet, EParticipantStatus, EPokerStatus, ERole, ICardSet } from '../../../shared-lib/src';
import { IServerParticipant, ITeam, ServerParticipant } from '../../src/objects';
import { PreflightService } from '../../src/services/implementation/preflight.service';
import { IPreflightService } from '../../src/services/interfaces/preflight.service';
import { IWebSocket, ReadyState } from "../../src/services/websocket";

export class Util {

  public static participant1Name = 'participant1';
  public static getParticipant1(): IServerParticipant {
    return new ServerParticipant(
      {
        nick: Util.participant1Name,
        participantId: Util.participant1Name,
        role: ERole.Developer,
        status: EParticipantStatus.Connected,
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
        status: EParticipantStatus.Connected,
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
        status: EParticipantStatus.Connected,
        observer: true
      }, Util.getSocket()
    );
  }

  public static observerName1 = 'observer1';
  public static getObserver1(): IServerParticipant {
    return new ServerParticipant(
      {
        nick: Util.observerName1,
        participantId: Util.observerName1,
        role: ERole.Developer,
        status: EParticipantStatus.Connected,
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
        status: EParticipantStatus.Connected,
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
        status: EParticipantStatus.Disconnected,
        observer: true
      },
      this.getSocket()
    );
  }
  public static team1Name = 'team1';
  public static getTeam1(status = EPokerStatus.Cleared): ITeam {
    return {
      teamName: Util.team1Name,
      lastAccessTime: Date.now(),
      status: status
    }
  }

  public static team2Name = 'team2';
  public static getTeam2(status = EPokerStatus.Cleared): ITeam {
    return {
      teamName: Util.team2Name,
      lastAccessTime: Date.now(),
      status: status
    }
  }

  public static getPreflightService(): IPreflightService {
    return new PreflightService();
  }

  public static getCardSet(): ICardSet {
    return {
      cardSet: ECardSet.Cohn,
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