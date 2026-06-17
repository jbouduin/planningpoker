import { browser } from "@wdio/globals";
import { EUser } from "../support/user.enum";

/**
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
export default class Page {

  public readonly nickKey: string = 'current_nick';
  public readonly teamNameKey: string = 'current_teamName';
  public readonly participantIdKey: string = 'current_participantId';

  /**
  * Opens a sub page of the page
  * @param path path of the sub page (e.g. /path/to/page.html)
  */
  public open(user: EUser, path: string) {
    return browser[user].url(`http://localhost:4200/${path}`);
  }

  //#region Dialog ------------------------------------------------------------
  public dialogTitle(user: EUser) {
    return browser[user].$("<shared-message-box />").$("<h1>");
  }

  public dialogSubmitButton(user: EUser)
  {
    return browser[user].$("<shared-message-box />").$("//*[@id=\"submit-button\"]");
  }

  public dialogCancelButton(user: EUser) {
    return browser[user].$("<shared-message-box />").$("//*[@id=\"cancel-button\"]");
  }
  //#endregion

  public getLocalStorageItem(user: EUser, key: string) {
    return browser[user].execute(`window.localStorage.getItem("${key}")`);
  }

  public async dumpLocalStorage(user:EUser) {
    const nick = await this.getLocalStorageItem(user, this.nickKey);
    const team = await this.getLocalStorageItem(user, this.teamNameKey);
    const uuid = await this.getLocalStorageItem(user, this.participantIdKey);
    /* eslint-disable no-console */
    console.log(`nick: ${nick}`);
    console.log(`team: ${team}`);
    console.log(`uuid: ${uuid}`);
    /* eslint-enable no-console */
  }

  public async clearLocalStorage(user: EUser) {
    return browser[user].execute(`window.localStorage.clear()`);
  }
}
