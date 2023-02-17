import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { MaterialModule } from '@app/material.module';
import { HomeRoutingModule } from './home-routing.module';
import { LandingComponent } from './components/landing/landing.component';
import { JoinComponent } from './components/join/join.component';
import { ContentPageComponent } from './components/content-page/content-page.component';

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
