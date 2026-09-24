import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";
import { Login } from "./components/login/login";
import { Register } from "./components/register/register";
import { Dashboard } from "./components/dashboard/dashboard";
import { RecipeForm } from "./components/recipe-form/recipe-form";
import { Profile } from "./components/profile/profile";
import { Feed } from "./components/feed/feed";

export const routes: Routes = [
  { path: "login", component: Login },
  { path: "register", component: Register },
  { path: "dashboard", component: Dashboard, canActivate: [authGuard] },
  { path: "recipe/:id", component: RecipeForm, canActivate: [authGuard] },
  { path: "recipe", component: RecipeForm, canActivate: [authGuard] },
  { path: "profile/:username", component: Profile, canActivate: [authGuard] },
  { path: "feed", component: Feed, canActivate: [authGuard] },
  { path: "**", redirectTo: "/dashboard", pathMatch: "full" },
];
