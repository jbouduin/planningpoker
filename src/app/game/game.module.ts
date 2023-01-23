import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/material.module';
import { GameRoutingModule } from './game-routing.module';
import { CardComponent } from './components/card/card.component';
import { GameComponent } from './components/game/game.component';
import { MemberComponent } from './components/member/member.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    GameRoutingModule
  ],
  declarations: [
    CardComponent,
    GameComponent,
    MemberComponent
  ]
})
export class GameModule { }
