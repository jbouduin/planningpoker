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
    public open (user: EUser, path: string) {
      return browser[user].url(`http://localhost:4200/${path}`);
    }
}
