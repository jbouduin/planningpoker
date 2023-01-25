import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionComponent } from './components/session/session.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  { path: '', component: SessionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class GameRoutingModule {}
