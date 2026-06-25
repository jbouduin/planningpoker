import { Routes } from '@angular/router';
import { TeamComponent } from './features/team';
import { GameComponent } from './features/game';
import { ContentComponent } from './features/content';

export const routes: Routes = [
  { path: '', component: TeamComponent },
  { path: 'game', component: GameComponent },
  { path: 'legal', component: ContentComponent, data: { path: 'legal' } },
  { path: 'privacy', component: ContentComponent, data: { path: 'privacy' } },
  { path: '**', redirectTo: '' }
];
