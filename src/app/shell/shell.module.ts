import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@app/material.module';

import { ConnectionComponent } from './connection/connection.component';
import { HeaderComponent } from './header/header.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { MainComponent } from './main/main.component';


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  declarations: [
    ConnectionComponent,
    HeaderComponent,
    LanguageSelectorComponent,
    MainComponent
  ]
})
export class ShellModule {}
