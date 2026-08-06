import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { RecipeForm } from './components/recipe-form/recipe-form';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'recipes/new', component: RecipeForm, canActivate: [authGuard] },
  { path: 'recipes/:id/edit', component: RecipeForm, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
