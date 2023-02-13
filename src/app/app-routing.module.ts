import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'about',
      loadChildren: () => import('./about/about.module').then(m => m.AboutModule)
    }
  ]),
  Shell.childRoutes([
    {
      path: 'game',
      loadChildren: () => import('./session/session.module').then(m => m.GameModule)
    }
  ]),
  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
