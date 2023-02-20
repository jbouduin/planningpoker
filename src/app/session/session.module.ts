import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '../material.module';
import { ChangeNickDialogComponent, ChangeScrumMasterDialogComponent, ContainerComponent, MemberButtonsComponent, MemberComponent, MemberPanelComponent, MyHandComponent, OverlayComponentComponent, ScrumMasterButtonsComponent, TeamHeaderComponent } from './components';
import { PokerTableComponent } from './components/';
import { GameRoutingModule } from './session-routing.module';

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
    ChangeScrumMasterDialogComponent,
    OverlayComponentComponent

  ]
})
export class SessionModule { }
