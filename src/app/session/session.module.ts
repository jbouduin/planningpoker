import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/material.module';
import { GameRoutingModule } from './session-routing.module';
import { CardComponent } from './components/card/card.component';
import { TeamComponent } from './components/team/team.component';
import { MemberComponent } from './components/member/member.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    GameRoutingModule
  ],
  declarations: [
    CardComponent,
    TeamComponent,
    MemberComponent
  ]
})
export class GameModule { }
