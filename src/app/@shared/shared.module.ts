import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@app/material.module';

import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { LoaderComponent } from './loader/loader.component';
import { SnackbarComponent } from './snackbar/snackbar.component';

@NgModule({
    imports: [
        MaterialModule,
        CommonModule
    ],
    declarations: [
        ConfirmationDialogComponent,
        LoaderComponent,
        SnackbarComponent
    ],
    exports: []
})
export class SharedModule {}
