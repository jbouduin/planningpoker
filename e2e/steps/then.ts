import { browser, expect } from '@wdio/globals';
import { Then } from '@wdio/cucumber-framework';

import gamePage from '../pages/game.page.js';
import startPage from '../pages/start.page.js';
import { EUser } from '../support/user.enum.js';
import Translations from '../support/translations.js';

//#region Game board ----------------------------------------------------------
Then(/^as (\w+) I should see the game board for (.*)$/, async (user:EUser, teamName: string) => {
  await expect(gamePage.teamHeader(user)).toHaveTextContaining(teamName);
});
//#endregion

//#region Member and Scrum Master buttons -------------------------------------
Then(/^as (\w+) I can dismiss (.*)$/, async (user: EUser, _teamName: string) => {
  const btn = await gamePage.leaveButton(user);
  await browser[user].waitUntil(() => btn.isClickable());
  const label = Translations.getTranslations("ScrumMasterButtons.Component.Button.EndSession.Label");
  await expect(btn).toHaveText(label);
});

Then(/^as (\w+) I can leave the team$/, async (user: EUser) => {
  const btn = await gamePage.leaveButton(user);
  await browser[user].waitUntil(() => btn.isClickable());
  const label = Translations.getTranslations("MemberButtons.Component.Button.Leave.Label");
  await expect(btn).toHaveText(label);
});

Then(/^as (\w+) I can start a poker round/, async (user: EUser) => {
  const btn = await gamePage.startButton(user);
  await browser[user].waitUntil(() => btn.isClickable());
  const label = Translations.getTranslations("ScrumMasterButtons.Component.Button.Start.Label");
  await expect(btn).toHaveText(label);
});

Then(/^as (\w+) I can take a break/, async (user: EUser) => {
  const btn = await gamePage.pauseButton(user);
  await browser[user].waitUntil(() => btn.isClickable());
  const label = Translations.getTranslations("MemberButtons.Component.Button.Pause.Label");
  await expect(btn).toHaveText(label);
});

Then(/^as (\w+) I can change the cardset/, async (user: EUser) => {
  const btn = await gamePage.changeCardSetButton(user);
  await browser[user].waitUntil(() => btn.isClickable());
  const label = Translations.getTranslations("ScrumMasterButtons.Component.Button.ChangeCardSet.Label");
  await expect(btn).toHaveText(label);
});
//#endregion

//#region labels on start page ------------------------------------------------
Then(/^the start button for (\w+) should be labeled (.*)$/, async(user:EUser, label: string) => {
  await expect(startPage.buttonCreate(user)).toHaveText(label);
});

Then(/^the join button for (\w+) should be labeled (.*)$/, async(user:EUser, label: string) => {
  await expect(startPage.buttonJoin(user)).toHaveText(label);
});
//#endregion

//#region snackbar ------------------------------------------------------------
Then(/^as (\w+) I should get an error message (.*)$/, async (user: EUser, key: string) => {
  await expect(gamePage.snackbarMessage(user)).toBeExisting();
  await expect(gamePage.snackbarMessage(user)).toHaveText(Translations.getTranslations(key));
});
//#endregion

//#region member panel --------------------------------------------------------
Then(/^as (\w+) I should see (\w+) as (.*)$/, async (user: EUser, otherUser: EUser| string, role: string) => {
  if (otherUser === 'myself') {
    otherUser = user
  }

  switch (role) {
    case 'scrum master':
      expect(gamePage.memberScrumMaster(user)).toHaveText(otherUser);
      break;
    case 'developer':
      expect(gamePage.memberDevelopers(user)).toHaveText(otherUser);
      break;
    case 'observer':
      expect(gamePage.memberObservers(user)).toHaveText(otherUser);
      break;
  }
});
//#endregion
