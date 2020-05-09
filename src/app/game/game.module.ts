import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './components/game.component';

@NgModule({
  imports: [CommonModule, TranslateModule, FlexLayoutModule, MaterialModule, GameRoutingModule],
  declarations: [GameComponent]
})
export class GameModule { }
