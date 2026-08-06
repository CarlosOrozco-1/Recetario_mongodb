import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { RecipeService, Recipe } from "../../services/recipe.service";

@Component({
  selector: "app-dashboard",
  imports: [CommonModule, RouterModule],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class Dashboard implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  recipes = signal<Recipe[]>([]);
  loading = signal(true);
  error = signal("");

  ngOnInit(): void {
    this.loadRecipes();
  }

  async loadRecipes(): Promise<void> {
    this.loading.set(true);
    this.error.set("");
    try {
      const recipes = await firstValueFrom(this.recipeService.getAll());
      this.recipes.set(recipes);
    } catch (err: unknown) {
      this.error.set("Error al cargar las recetas");
    } finally {
      this.loading.set(false);
    }
  }

  async onDelete(id: string): Promise<void> {
    if (!confirm("¿Eliminar esta receta?")) return;
    try {
      await firstValueFrom(this.recipeService.delete(id));
      this.loadRecipes();
    } catch (err: unknown) {
      this.error.set("Error al eliminar la receta");
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
