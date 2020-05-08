import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';

import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { LoaderComponent } from './loader/loader.component';
import { SnackbarComponent } from './snackbar/snackbar.component';

@NgModule({
  imports: [
    FlexLayoutModule,
    MaterialModule,
    CommonModule],
  declarations: [
    ConfirmationDialogComponent,
    LoaderComponent,
    SnackbarComponent],
  exports: [],
  entryComponents: [
    ConfirmationDialogComponent,
    SnackbarComponent
  ]
})
export class SharedModule {}
