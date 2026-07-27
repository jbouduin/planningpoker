import { extract } from '../../core';

export class AppTranslationKeys {
  //#region Buttons -----------------------------------------------------------
  public static readonly BUTTON_CANCEL_LABEL = extract('App.Button.Cancel');
  public static readonly BUTTON_NO_LABEL = extract('App.Button.No');
  public static readonly BUTTON_OK_LABEL = extract('App.Button.OK');
  public static readonly BUTTON_SAVE_LABEL = extract('App.Button.Save');
  public static readonly BUTTON_YES_LABEL = extract('App.Button.Yes');
  //#endregion

  //#region Confirmation Dialog -----------------------------------------------
  public static readonly CONFIRMATION_DIALOG_TEXT = extract('App.Confirmation.Text');
  public static readonly CONFIRMATION_DIALOG_TITLE = extract('App.Confirmation.Title');
  //#endregion

  //#region Inputs ------------------------------------------------------------
  public static readonly INPUT_ERROR_MANDATORY = extract('App.Input.Error.Mandatory');
  public static readonly INPUT_NICK_NAME_LABEL = extract('App.Input.Nick.Label');
  public static readonly INPUT_NICK_NAME_PLACEHOLDER = extract('App.Input.Nick.Placeholder');
  public static readonly INPUT_TEAM_LABEL = extract('App.Input.Team.Label');
  public static readonly INPUT_TEAM_PLACEHOLDER = extract('App.Input.Team.Placeholder');
  //#endregion

  //#region Labels ------------------------------------------------------------
  public static readonly LABEL_ME = extract('App.Label.Me');
  //#endregion

  //#region Selects -----------------------------------------------------------
  public static readonly SELECT_CARDSET_LABEL = extract('App.Select.CardSet');
  //#endregion
}
