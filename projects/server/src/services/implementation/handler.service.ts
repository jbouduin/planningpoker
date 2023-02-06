import { inject, injectable } from "inversify";

import STORAGETYPES from '../../storage/storage.types';
import SERVICETYPES from "../service.types";

import { ClientMessage, EClientMessageType, EErrorCode, EMemberStatusChange, EParticipantStatus, ERole, ICreatemessage, IEstimateMessage, IJoinMessage, ILeaveMessage, IRejoinMessage } from "../../../../shared-lib/lib";
import { Estimation, ITeam, LooseObject, Participant } from "../../objects";
import { IStorageService } from '../../storage/interfaces';
import { ICardService, IMessageService } from "../interfaces";
import { IWebSocket } from '../websocket';

@injectable()
export class HandlerService {

  //#region Private properties ------------------------------------------------
  private readonly cardService: ICardService;
  private readonly messageService: IMessageService;
  private readonly storage: IStorageService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.CardService) cardService: ICardService,
    @inject(SERVICETYPES.MessageService) messageService: IMessageService,
    @inject(STORAGETYPES.StorageService) storage: IStorageService) {
    this.cardService = cardService;
    this.messageService = messageService;
    this.storage = storage;
  }
  //#endregion

  //#region IHandlerService Methods -------------------------------------------
  public handleClose(ws: IWebSocket): void {
    // if an existing connection closes
    // set the connection status to disconnected
    // if the user was in a game: send other participants an update
    const closed = this.storage.filterParticipants((participant: Participant) => participant.socket == ws)[0];
    if (closed) {
      if (closed.status !== EParticipantStatus.Paused) {
        console.log(`${new Date().toISOString()}: '${closed.nick}'' has been disconnected`);
        closed.status = EParticipantStatus.Disconnected;
        const team = this.storage.getTeamOfParticipant(closed.uuid);
        if (team) {
          console.log('sending disconnection to other participants');
          this.messageService.broadcastMemberChange(team, closed, EMemberStatusChange.Disconnected);
        }
      }
    }
    else {
      console.log('disconnected participant is unknown');
    }
  }

  public handleConnect(ws: IWebSocket): Participant {
    const newParticipant = this.storage.createParticipant(ws);
    // send the participant himself back, so he knows his assigned uuid
    this.messageService.sendInit(newParticipant);
    return newParticipant;
  }

  public handleError(ws: IWebSocket, err: unknown): void {
    console.log(`${new Date().toISOString()}: ERROR ${err}`);

    if (err instanceof Error) {
      this.messageService.sendException(ws, err.message);
    } else {
      this.messageService.sendException(ws, JSON.stringify(err));
    }
  }

  public handleMessage(message: ClientMessage, teamName: string, ws: IWebSocket): void {
    console.log(`${new Date().toISOString()}: <= ${message.type}: ${message}`);

    // const preflight = this.preflight(message, req.params.team);
    // if (preflight === EErrorCode.ParticipantNotFound) {
    //   this.sendParticipantNotFound(ws);
    // } else if (preflight == EErrorCode.TeamDoesNotExist) {
    //   this.sendTeamNotFound(ws);
    // }
    // else {
    //   // make sure we always have a sender, although preflight has checked this
    //   const sender = this.getParticipantBySenderUuid(message.senderUuid, ws);
    //   const auth = this.checkAuthorization(message.type, sender.role);
    //   if (preflight === EErrorCode.NoError && auth === EErrorCode.NoError) {
    //     // make sure we always have a game, although preflight has checked this
    //     const team = this.teams.get(req.params.team) || this.factoryService.dummyGame(-1);  //this.cardService.unknownEstimationIndex);
    //     // this.handlerService.HandleMessage(sender, message, team, ws);
    //   } else { // end of preflight = NoError && auth = NoError
    //     if (preflight !== EErrorCode.NoError) {
    //       this.sendErrorMessage(sender, preflight);
    //     } else {
    //       this.sendErrorMessage(sender, auth);
    //     }
    //   }
    // } // end of else preflight != ParticipantNotFound
    const participant = this.storage.getParticipant(message.senderUuid);
    const team = this.storage.getTeam(teamName);
    if (participant && team) {
      this.processMessage(participant, message, team, ws)
    }
  }

  public handlePing(): void {
    console.log(`${new Date().toISOString()}: ping`);
    this.storage
      .filterParticipants((participant: Participant) => participant.status === EParticipantStatus.Connected)
      .forEach(participant => this.messageService.sendPing(participant));
  }

  public handleReset(): string {
    const response: LooseObject = {};
    response.teams = 0;
    response.totalMembers = 0;
    response.removedTeams = new Array<LooseObject>();
    for (const team of this.storage.filterTeams((_team: ITeam) => true)) {
      const removedTeam: LooseObject = {};
      console.log(`System reset: Ending game '${team.teamName}'`);
      removedTeam.team = team.teamName;
      removedTeam.members = 0;
      removedTeam.removedMembers = new Array<string>();
      team.allMembers.forEach((participant: Participant) => {
        this.messageService.sendReset(participant);
        this.storage.deleteParticipant(participant.uuid);
        removedTeam.removedMembers.push(`${participant.nick} - ${participant.uuid}`);
        response.totalMembers++;
        removedTeam.members++;
      });
      response.removedTeams.push(removedTeam);
      this.storage.deleteTeam(team.teamName);
      response.teams++;
    }
    return JSON.stringify(response);
  }
  //#endregion

  //#region private methods
  private processMessage(sender: Participant, message: ClientMessage, team: ITeam, ws: IWebSocket): void {
    switch (message.type) {
      case (EClientMessageType.Create): {
        this.handleCreate(sender, <ICreatemessage>message);
        break;
      }
      case (EClientMessageType.Estimate): {
        this.handleEstimate(sender, <IEstimateMessage>message, team);
        break;
      }
      case (EClientMessageType.Join): {
        this.handleJoin(sender, <IJoinMessage>message, team);
        break;
      }
      case (EClientMessageType.Disconnect): {
        this.handleKillMe(sender);
        break;
      }
      case (EClientMessageType.Leave): {
        this.handleLeave(sender, <ILeaveMessage>message, team);
        break;
      }
      case (EClientMessageType.Pause): {
        this.handlePause(sender, team);
        break;
      }
      case (EClientMessageType.Reveal): {
        this.handleReveal(sender, team);
        break;
      }
      case (EClientMessageType.Start): {
        this.handleStart(sender, team);
        break;
      }
      case (EClientMessageType.Rejoin): {
        this.handleRejoin(sender, <IRejoinMessage>message, ws);
        break;
      }
      default: {
        this.messageService.sendErrorMessage(sender, EErrorCode.UnknownVerb);
        console.log('unexpected messagetype');
      }
    } // end switch
  }

  private handleCreate(sender: Participant, message: ICreatemessage): void {
    console.log(`Create: '${sender.nick}' is creating '${message.data.team}'`);
    const newGame = this.storage.createTeam(message.data.team, this.cardService.unknownEstimationIndex);
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    sender.role = ERole.ScrumMaster;
    newGame.upsertMember(sender);
    this.storage.joinTeam(message.senderUuid, message.data.team);
    // provide the sender with the current game state
    this.messageService.sendTeamInfo(sender, newGame);
  }

  private handleEstimate(sender: Participant, message: IEstimateMessage, team: ITeam): void {
    const estimation = new Estimation(sender.uuid, message.data);
    if (estimation.card >= 0) {
      team.upsertEstimation(estimation);
    }
    else {
      team.deleteEstimation(estimation.participantUuid);
    }
    this.messageService.broadcastEstimation(team, estimation);
  }

  private handleJoin(sender: Participant, message: IJoinMessage, team: ITeam): void {
    console.log(`Join: '${sender.nick}' is joining '${message.data.team}'`);
    sender.role = ERole.Developer;
    sender.observer = message.data.observer;
    sender.nick = message.data.nick;
    team.upsertMember(sender);
    this.storage.joinTeam(message.senderUuid, message.data.team);
    // provide the sender with the curren game state
    this.messageService.sendTeamInfo(sender, team);
    // tell the others someone joined
    this.messageService.broadcastMemberChange(team, sender, EMemberStatusChange.Joined);
  }

  private handleKillMe(sender: Participant): void {
    console.log(`Kill: '${sender.nick}' asked to be disconnected`);
    sender.socket.close();
  }

  private handleLeave(sender: Participant, _message: ILeaveMessage, team: ITeam): void {
    if (sender.role === ERole.ScrumMaster) {
      console.log(`End game: '${sender.nick}' is ending '${team.teamName}'`);
      this.messageService.broadcastSessionEnded(team, sender);
      team
        .filterMembers(_participant => true)
        .forEach(participant => this.storage.deleteParticipant(participant.uuid));
      this.storage.deleteTeam(team.teamName);
      // aknowledge to the scrum master
      this.messageService.sendSessionEnded(sender);
    } else {
      console.log(`Leave: '${sender.nick}' is leaving '${team.teamName}'`);
      team.removeMember(sender.uuid);
      this.storage.deleteParticipant(sender.uuid);
      // tell the others someone left
      sender.status = EParticipantStatus.Left;
      this.messageService.broadcastMemberChange(team, sender, EMemberStatusChange.Left);
      this.messageService.sendLeft(sender);
    }

  }

  private handlePause(sender: Participant, game: ITeam): void {
    console.log(`Pause: '${sender.nick}'`);
    // send the data back as aknowledgment
    sender.status = EParticipantStatus.Paused;
    this.messageService.sendSelf(sender);
    this.messageService.broadcastMemberChange(game, sender, EMemberStatusChange.Paused);
  }

  private handleReveal(sender: Participant, team: ITeam): void {
    if (sender.role !== ERole.ScrumMaster) {
      this.messageService.sendErrorMessage(sender, EErrorCode.ScrumMasterRequired);
    } else {
      team.reveal();
      this.messageService.broadcastPokerStatus(team);
      this.messageService.broadcastAllEstimations(team);
    }
  }

  private handleStart(sender: Participant, team: ITeam): void {
    if (sender.role !== ERole.ScrumMaster) {
      this.messageService.sendErrorMessage(sender, EErrorCode.ScrumMasterRequired);
    } else {
      team.startEstimating();
      this.messageService.broadcastClearEstimations(team);
      this.messageService.broadcastPokerStatus(team);
    }
  }

  private handleRejoin(sender: Participant, message: IRejoinMessage, ws: any): void {
    console.log(`Rejoin: '${message.senderUuid}' => '${message.data}' `);
    // find the original participant and the game he was in
    const oldParticipant = this.storage.getParticipant(message.data);
    const teamToRejoin = this.storage.getTeamOfParticipant(message.data);

    if (teamToRejoin && oldParticipant) {
      // remove the sender
      this.storage.deleteParticipant(sender.uuid);
      // update the original participant
      oldParticipant.status = EParticipantStatus.Connected;
      oldParticipant.socket = ws;
      // update the sender
      this.messageService.sendSelf(oldParticipant);
      // provide the rejoining participant with the curren game state
      this.messageService.sendTeamInfo(oldParticipant, teamToRejoin);
      // tell the others that participant rejoined
      this.messageService.broadcastMemberChange(teamToRejoin, oldParticipant, EMemberStatusChange.Rejoined);
    }
  }
  //#endregion
}