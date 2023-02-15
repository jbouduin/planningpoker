import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/material.module';

import { MessageBoxComponent } from './components/message-dialog/message-box.component';
import { LoaderComponent } from './components/loader/loader.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { CardComponent } from './components/card/card.component';
import { CardSetDialogComponent } from './components/card-set-dialog/card-set-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
