import { When } from '@wdio/cucumber-framework';
import { browser } from '@wdio/globals';

import startPage from '../pages/start.page.js';
import { EUser } from '../support/user.enum.js';

When(/^as (\w+) I create team (\w+) (.+)$/, async (user: EUser, teamName: string, observing: string) => {
  await startPage.createTeam(teamName, user, observing === 'observing');
});

When(/^as (\w+) I join team (\w+) (.+)$/, async (user: EUser, teamName: string, observing: string) => {
  await startPage.joinTeam(teamName, user, observing === 'observing');
});

When(/^as (\w+) I rejoin my team$/, async (user: EUser) => {
  const btn = await startPage.dialogSubmitButton(user);
  await browser[user].waitUntil(() => btn.isClickable());
  await btn.click();
});

When(/^as (\w+) I do not rejoin my team$/, async (user: EUser) => {
  const btn = await startPage.dialogCancelButton(user);
  await browser[user].waitUntil(() => btn.isClickable());
  await btn.click();
});

When(/^as (\w+) I change my language to (.*)$/, async (user: EUser, language: string) => {
  await browser[user].$("<shell-language-selector />").$('<button />').click();
  const btn = await browser[user].$(`//*[@id="${language}"]`);
  await browser[user].waitUntil(() => btn.isClickable());
  btn.click();
});

When(/^as (\w+) I return to the start page$/, async (user: EUser) => {
  // await dummyPage.open(user);
  // browser[user].pause(60000);
  await startPage.open(user);
  await startPage.dumpLocalStorage(user);
  // browser[user].back();
});
