import { Given } from '@wdio/cucumber-framework';
import StartPage from '../pages/start.page.js';
import { EUser } from '../support/user.enum.js';

Given(/^I am on the (\w+) page as (.*)$/, async (page: string, user: EUser) => {
  await StartPage.open(user);
});

Given(/^the (\w+) has created team (.+)$/, async (user: EUser, teamName: string) => {
  await StartPage.open(user);
  await StartPage.createTeam(teamName, user);
});
