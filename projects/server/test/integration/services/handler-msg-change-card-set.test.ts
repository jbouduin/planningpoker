import { describe, expect, jest, test } from '@jest/globals';

import SERVICETYPES from '../../../src/services/service.types';

import { ICardService, IHandlerService } from '../../../src/services/interfaces';

import { ECardSet, EClientMessageType, EMemberStatusChange, EServerMessageType, ICardSetMessage, IChangeCardSetMessage } from '../../../../shared-lib/src';
import { Util } from "./helpers/util";


describe('Change card set => OK', () => {
  test('Change card set', () => {
    const container = Util.getContainer();
    const handlerService = container.get<IHandlerService>(SERVICETYPES.HandlerService);

    // create unaffected Team
    const unaffectedTeam = Util.createUnaffectedTeam(handlerService);

    // customize a card set
    const customizedCohn = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
    customizedCohn.cards.splice(9, 3);

    // create team
    const scrumMaster = Util.createTeamNew(handlerService, Util.team1Name, Util.scrumMaster1Nick);
    // participant joining team 1
    const participant = Util.joinTeamNew(handlerService, Util.team1Name, Util.participant1Nick);
    // change card set
    const message: IChangeCardSetMessage = {
      senderId: scrumMaster.participantId,
      data: customizedCohn,
      type: EClientMessageType.ChangeCardSet
    };
    // TODO NOW implement sending message in IAParticipant
    handlerService.handleMessage(message, Util.team1Name, scrumMaster.socket);

    // test: scrum master should have received 1 MC join + 1 card list
    expect(scrumMaster.messagesReceivedAfterInitial).toBe(2);
    expect(scrumMaster.countMemberChangedMessages(EMemberStatusChange.Joined)).toBe(1);
    expect(scrumMaster.countMessageType(EServerMessageType.CardList)).toBe(1);
    let updatedCardSetMessage = scrumMaster.extractMessage<ICardSetMessage>(EServerMessageType.CardList);
    expect(updatedCardSetMessage).toBeDefined();
    if (updatedCardSetMessage) {
      expect(updatedCardSetMessage.data.cardSet).toBe(customizedCohn.cardSet);
      expect(updatedCardSetMessage.data.cards).toHaveLength(customizedCohn.cards.length);
    }

    // test: participant should have received card list message only
    expect(participant.messagesReceivedAfterInitial).toBe(1);
    expect(participant.countMessageType(EServerMessageType.CardList)).toBe(1);
    updatedCardSetMessage = participant.extractMessage<ICardSetMessage>(EServerMessageType.CardList);
    expect(updatedCardSetMessage).toBeDefined();
    if (updatedCardSetMessage) {
      expect(updatedCardSetMessage.data.cardSet).toBe(customizedCohn.cardSet);
      expect(updatedCardSetMessage.data.cards).toHaveLength(customizedCohn.cards.length);
    }

    // test: unaffected team
    expect(unaffectedTeam.isUnaffected).toBe(true);
  });
});


describe('Change card set => Failure', () => {
  // TODO 2374 test('Team not found', () => { });
  // TODO 2374 test('Sender not found', () => { });
  // TODO 2374 test('Sender not scrum master', () => { });
  // TODO 2374 test('Sender not in any team', () => { });
  // TODO 2374 test('Sender in different team', () => { });
  // TODO 2366 test('card set invalid', () => { });

});