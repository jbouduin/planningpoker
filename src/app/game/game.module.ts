import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/material.module';
import { GameRoutingModule } from './game-routing.module';
import { CardComponent } from './components/card/card.component';
import { EstimationComponent } from './components/estimation/estimation.component';
import { GameComponent } from './components/game/game.component';
import { ParticipantComponent } from './components/participant/participant.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    GameRoutingModule
  ],
  declarations: [
    CardComponent,
    EstimationComponent,
    GameComponent,
    ParticipantComponent
  ]
})
export class GameModule { }
