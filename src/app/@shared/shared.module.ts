import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { CardComponent, CardSetDialogComponent, MessageBoxComponent, SnackbarComponent } from './components';
import { LoaderComponent } from './components/';

@NgModule({
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  declarations: [
    MessageBoxComponent,
    LoaderComponent,
    SnackbarComponent,
    CardComponent,
    CardSetDialogComponent
  ],
  exports: [CardComponent]
})
export class SharedModule { }
