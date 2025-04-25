import { browser } from "@wdio/globals";
import { EUser } from "../support/user.enum.js";
import Page from './page.js';

class StartPage extends Page {

  public createTeamName(user: EUser) {
    return browser[user].$("//*[@id=\"create-team\"]").$("//*[@id=\"team-input\"]");
  }

  public createUserName(user: EUser) {
    return browser[user].$("//*[@id=\"create-team\"]").$("//*[@id=\"nick-input\"]");
  }

  public createObserve(user: EUser) {
    return browser[user].$("//*[@id=\"create-team\"]").$("//*[@id=\"observe-input\"]");
  }

  public buttonCreate(user: EUser) {
    return browser[user].$("//*[@id=\"create-team\"]").$("<button />");
  }

  public joinTeamName(user: EUser) {
    return browser[user].$("//*[@id=\"join-team\"]").$("//*[@id=\"team-input\"]");
  }

  public joinUserName(user: EUser) {
    return browser[user].$("//*[@id=\"join-team\"]").$("//*[@id=\"nick-input\"]");
  }

  public joinObserve(user: EUser) {
    return browser[user].$("//*[@id=\"join-team\"]").$("//*[@id=\"observe-input\"]");
  }

  public buttonJoin(user: EUser) {
    return browser[user].$("//*[@id=\"join-team\"]").$("<button />");
  }

  public async createTeam(teamName: string, user: EUser, observing: boolean): Promise<void> {
    await this.createTeamName(user).setValue(teamName);
    await this.createUserName(user).setValue(user);
    if (observing) {
      const cb = await this.createObserve(user);
      browser[user].waitUntil(() => cb.isClickable());
      await cb.click();
    }
    const btn = await this.buttonCreate(user);
    browser[user].waitUntil(() => btn.isClickable());
    await btn.click();
  }

  public async joinTeam(teamName: string, user: EUser, observing: boolean): Promise<void> {
    await this.joinTeamName(user).setValue(teamName);
    await this.joinUserName(user).setValue(user);
    if (observing) {
      const cb = await this.joinObserve(user);
      browser[user].waitUntil(() => cb.isClickable());
      await cb.click();
    }
    const btn = await this.buttonJoin(user);
    browser[user].waitUntil(() => btn.isClickable());
    await btn.click();
  }

  public open(user: EUser) {
    return super.open(user, 'home');
  }
}

export default new StartPage();
