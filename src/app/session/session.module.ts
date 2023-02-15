import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '@app/material.module';
import { ChangeNickDialogComponent } from './components/change-nick-dialog/change-nick-dialog.component';
import { ChangeScrumMasterDialogComponent } from './components/change-scrum-master-dialog/change-scrum-master-dialog.component';
import { ContainerComponent } from './components/container/container.component';
import { MemberButtonsComponent } from './components/member-buttons/member-buttons.component';
import { MemberPanelComponent } from './components/member-panel/member-panel.component';
import { MemberComponent } from './components/member/member.component';
import { MyHandComponent } from './components/my-hand/my-hand.component';
import { PokerTableComponent } from './components/poker-table/poker-table.component';
import { ScrumMasterButtonsComponent } from './components/scrum-master-buttons/scrum-master-buttons.component';
import { TeamHeaderComponent } from './components/team-header/team-header.component';
import { GameRoutingModule } from './session-routing.module';
import { SharedModule } from '@app/@shared';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    GameRoutingModule,
    SharedModule
  ],
  declarations: [
    ContainerComponent,
    MemberComponent,
    MemberPanelComponent,
    TeamHeaderComponent,
    PokerTableComponent,
    MyHandComponent,
    MemberButtonsComponent,
    ScrumMasterButtonsComponent,
    ChangeNickDialogComponent,
    ChangeScrumMasterDialogComponent

  ]
})
export class SessionModule { }
