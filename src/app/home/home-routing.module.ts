import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Shell } from '@shell/shell.service';
import { ContentPageComponent } from './components/content-page/content-page.component';
import { LandingComponent } from './components/landing/landing.component';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: LandingComponent },
    { path: 'legal', component: ContentPageComponent, data: {content: 'legal'} },
    { path: 'privacy', component: ContentPageComponent, data: { content: 'privacy' } },
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class HomeRoutingModule {}
