import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/material.module';
import { GameRoutingModule } from './session-routing.module';
import { CardComponent } from './components/card/card.component';
import { ContainerComponent } from './components/container/container.component';
import { MemberComponent } from './components/member/member.component';
import { MemberPanelComponent } from './components/member-panel/member-panel.component';
import { TeamHeaderComponent } from './components/team-header/team-header.component';
import { PokerTableComponent } from './components/poker-table/poker-table.component';
import { MyHandComponent } from './components/my-hand/my-hand.component';
import { MemberButtonsComponent } from './components/member-buttons/member-buttons.component';
import { ScrumMasterButtonsComponent } from './components/scrum-master-buttons/scrum-master-buttons.component';
import { ChangeNickDialogComponent } from './components/change-nick-dialog/change-nick-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    GameRoutingModule
  ],
  declarations: [
    CardComponent,
    ContainerComponent,
    MemberComponent,
    MemberPanelComponent,
    TeamHeaderComponent,
    PokerTableComponent,
    MyHandComponent,
    MemberButtonsComponent,
    ScrumMasterButtonsComponent,
    ChangeNickDialogComponent
  ]
})
export class GameModule { }
