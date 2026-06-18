import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../material.module';
import { HeaderComponent, LanguageSelectorComponent, MainComponent } from './components';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  declarations: [
    HeaderComponent,
    LanguageSelectorComponent,
    MainComponent
  ]
})
export class ShellModule {}
