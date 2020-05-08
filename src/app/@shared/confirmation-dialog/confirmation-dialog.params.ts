export class ConfirmationDialogParams {

  // <editor-fold desc='Public properties'>
  public cancelButtonLabel: string;
  public okButtonLabel: string;
  public text: string;
  public title: string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.cancelButtonLabel = 'Cancel';
    this.okButtonLabel = 'OK';
    this.title = 'Confirm';
    this.text = 'Continue?';
  }
  // </editor-fold>
}
