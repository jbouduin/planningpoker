import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/material.module';
import { GameRoutingModule } from './session-routing.module';
import { CardComponent } from './components/card/card.component';
import { SessionComponent } from './components/session/session.component';
import { MemberComponent } from './components/member/member.component';
import { MemberPanelComponent } from './components/member-panel/member-panel.component';
import { TeamHeaderComponent } from './components/team-header/team-header.component';
import { PokerTableComponent } from './components/poker-table/poker-table.component';
import { MyHandComponent } from './components/my-hand/my-hand.component';
import { MemberButtonsComponent } from './components/member-buttons/member-buttons.component';
import { ScrumMasterButtonsComponent } from './components/scrum-master-buttons/scrum-master-buttons.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    GameRoutingModule
  ],
  declarations: [
    CardComponent,
    SessionComponent,
    MemberComponent,
    MemberPanelComponent,
    TeamHeaderComponent,
    PokerTableComponent,
    MyHandComponent,
    MemberButtonsComponent,
    ScrumMasterButtonsComponent
  ]
})
export class GameModule { }
