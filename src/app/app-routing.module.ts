import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { Shell } from '@app/shell/shell.service';

// TODO from the migration guide:
// You can no longer specify lazy - loaded routes by setting a string value to loadChildren.Make sure you move to dynamic ESM import statements.
const routes: Routes = [
  Shell.childRoutes([{
    path: 'about',
    loadChildren: () => import('./about/about.module').then( m => m.AboutModule)
  }]),
  Shell.childRoutes([{
    path: 'game',
    loadChildren: () => import('./game/game.module').then( m => m.GameModule)
  }]),
  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
