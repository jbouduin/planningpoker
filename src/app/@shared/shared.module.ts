import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { CardSetDialogComponent } from './components/card-set-dialog/card-set-dialog.component';
import { CardComponent } from './components/card/card.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';

@NgModule({
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  declarations: [
    MessageBoxComponent,
    SnackbarComponent,
    CardComponent,
    CardSetDialogComponent
  ],
  exports: [CardComponent]
})
export class SharedModule { }
