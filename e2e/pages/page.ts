import { browser } from "@wdio/globals";
import { EUser } from "../support/user.enum";

/**
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
export default class Page {
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

  public dialogSubmitButton(user: EUser) {
    return browser[user].$("<shared-message-box />").$("//*[@id=\"submit-button\"]");
  }

  public dialogCancelButton(user: EUser) {
    return browser[user].$("<shared-message-box />").$("//*[@id=\"cancel-button\"]");
  }
  //#endregion

}
