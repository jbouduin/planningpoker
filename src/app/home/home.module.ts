import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from '../material.module';
import { ContentPageComponent, JoinComponent, LandingComponent } from './components';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CoreModule,
    SharedModule,
    MaterialModule,
    HomeRoutingModule
  ],
  declarations: [
    LandingComponent,
    JoinComponent,
    ContentPageComponent
  ],
  providers: []
})
export class HomeModule {}
