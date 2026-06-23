import { AfterViewInit, Component } from '@angular/core';
import { CreateComponent } from './components/create/create.component';
import { JoinComponent } from './components/join/join.component';
import { extract, ICanRejoinResult, SessionService } from '../../core';
import { DialogService } from '../../shared/service/dialog.service';
import { MessageBoxParams } from '../../shared/components/message-box/message-box.params';

@Component({
  selector: 'app-team.component',
  imports: [CreateComponent, JoinComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements AfterViewInit {
  private dialogSvc: DialogService;
  private sessionSvc: SessionService;

  //#region Constructor & C° --------------------------------------------------
  public constructor(dialogSvc: DialogService, sessionSvc: SessionService) {
    this.dialogSvc = dialogSvc;
    this.sessionSvc = sessionSvc;
  }
  //#endregion

  public ngAfterViewInit(): void {
    this.sessionSvc.canRejoin().subscribe((result: ICanRejoinResult) => {
      if (result.canRejoin) {
        const params = new MessageBoxParams();
        params.cancelButtonLabelKey = extract('Button.Generic.Label.No');
        params.okButtonLabelKey = extract('Button.Generic.Label.Yes');
        params.textKey = extract('MessageBox.Rejoin_$team_as_$nick.Text');
        params.textParams = {
          team: result.team,
          nick: result.nick
        };
        params.titleKey = extract('MessageBox.Rejoin_$team_as_$nick.Title');
        this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.sessionSvc.rejoinSession(result.team!, result.participantId!);
          } else {
            this.sessionSvc.leaveSession(); // this currently throws an error, we could introduce a new method: leaveFromDisconnected(...)
          }
        });
      } else {
        this.sessionSvc.clearSessionData();
      }
    });
  }
}
