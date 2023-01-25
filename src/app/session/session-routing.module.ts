import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamComponent } from './components/team/team.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  { path: '', component: TeamComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class GameRoutingModule {}
