import { Given } from '@wdio/cucumber-framework';

import LoginPage from '../pages/login.page.js';


const pages = {
  login: LoginPage
}

Given(/^I am on the (\w+) page$/, async (page) => {
  await pages[page].open()
});
