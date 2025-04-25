import { Then } from '@wdio/cucumber-framework';
import { browser, expect } from '@wdio/globals';
import gamePage from '../pages/game.page.js';
import memberListComponent from '../pages/member-list.component.js';
import startPage from '../pages/start.page.js';
import Translations from '../support/translations.js';
import { EUser } from '../support/user.enum.js';

//#region Location check ------------------------------------------------------
Then(/^as (\w+) I should see the game board for (.*)$/, async (user: EUser, teamName: string) => {
  await expect(gamePage.teamHeader(user)).toHaveTextContaining(teamName);
});

Then(/^as (\w+) I should see the start page$/, async (user: EUser) => {
  await expect(startPage.buttonCreate(user)).toBeExisting();
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
Then(/^the start button for (\w+) should be labeled (.*)$/, async (user: EUser, label: string) => {
  await expect(startPage.buttonCreate(user)).toHaveText(label);
});

Then(/^the join button for (\w+) should be labeled (.*)$/, async (user: EUser, label: string) => {
  await expect(startPage.buttonJoin(user)).toHaveText(label);
});
//#endregion

//#region snackbar ------------------------------------------------------------
Then(/^as (\w+) I should get an error message (.*)$/, async (user: EUser, key: string) => {
  const msg = await gamePage.snackbarMessage(user);
  await expect(msg).toBeExisting();
  await expect(msg).toHaveText(Translations.getTranslations(key));
});
//#endregion

//#region member panel --------------------------------------------------------
Then(/^as (\w+) I should see (\w+) as (.*)$/, async (user: EUser, otherUser: EUser | string, role: string) => {
  if (otherUser === 'myself') {
    otherUser = user
  }

  if (role === 'scrum master') {
    const sm = await memberListComponent.memberScrumMaster(user);
    await expect(sm).toBeExisting();
    await expect(sm).toHaveTextContaining(otherUser);
  } else if (role === 'developer') {
    const dev = await memberListComponent.memberDevelopers(user);
    await expect(dev).toBeExisting();
    await expect(dev).toHaveTextContaining(otherUser);
  } else if (role === 'observer') {
    const obs = await memberListComponent.memberObservers(user);
    await expect(obs).toBeExisting();
    await expect(obs).toHaveTextContaining(otherUser);
  }

});
//#endregion

//#region Dialog --------------------------------------------------------------
Then(/^as (\w+) I should see a dialog with title (.*)$/, async (user: EUser, key: string) => {
  const title = await gamePage.dialogTitle(user);
  await expect(title).toBeExisting();
  await expect(title).toHaveText(Translations.getTranslations(key));
});

Then(/^as (\w+) I should see a dialog with a submit button labeled (.*)$/, async (user: EUser, key: string) => {
  const btn = await gamePage.dialogSubmitButton(user);
  await expect(btn).toBeExisting();
  await expect(btn).toHaveText(Translations.getTranslations(key));
});

Then(/^as (\w+) I should see a dialog with a cancel button labeled (.*)$/, async (user: EUser, key: string) => {
  const btn = await gamePage.dialogCancelButton(user);
  await expect(btn).toBeExisting();
  await expect(btn).toHaveText(Translations.getTranslations(key));
});
//#endregion
