import { AfterViewInit, Component, inject } from '@angular/core';
import { extract, ICanRejoinResult, SessionService } from '../../core';
import { MessageDialogParams } from '../../shared/components';
import { DialogService } from '../../shared/services';
import { CreateComponent } from './components/create/create.component';
import { JoinComponent } from './components/join/join.component';

@Component({
  selector: 'app-team.component',
  imports: [CreateComponent, JoinComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements AfterViewInit {
  //#region Private Fields ----------------------------------------------------
  private dialogSvc: DialogService;
  private sessionSvc: SessionService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.dialogSvc = inject(DialogService);
    this.sessionSvc = inject(SessionService);
  }

  public ngAfterViewInit(): void {
    this.sessionSvc.canRejoin().subscribe((result: ICanRejoinResult) => {
      if (result.canRejoin) {
        const params = new MessageDialogParams();
        params.cancelButtonLabelKey = extract('App.Button.No');
        params.okButtonLabelKey = extract('App.Button.Yes');
        params.textKey = extract('Team.Message.Rejoin_$team_as_$nick.Text');
        params.textParams = {
          team: result.team,
          nick: result.nick
        };
        params.titleKey = extract('Team.Message.Rejoin_$team_as_$nick.Title');
        this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.sessionSvc.rejoinSession(result.team!, result.participantId!);
          } else {
            this.sessionSvc.leaveDisconnectedSession(result.team!, result.participantId!);
          }
        });
      }
    });
  }
  //#endregion
}
