import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { RecipeService, Recipe } from "../../services/recipe.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-dashboard",
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class Dashboard implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  recipes = signal<Recipe[]>([]);
  loading = signal(true);
  error = signal("");
  
  // Navigation & Filtering
  activeTab = signal<"mine" | "public">("mine");
  searchQuery = signal("");
  selectedCategory = signal<string>("Todas");
  sortBy = signal<"recent" | "title">("recent");
  showOnlyFavorites = signal<boolean>(false);

  selectedRecipe = signal<Recipe | null>(null);
  recipeToDelete = signal<Recipe | null>(null);

  userName = computed(() => {
    const user = this.authService.getUser();
    return user?.name || "Chef";
  });

  // Calculate stats based on own recipes
  ownRecipes = computed(() => {
    const currentUser = this.authService.getUser();
    if (!currentUser) return [];
    return this.recipes().filter(r => {
      const recipeUserId = typeof r.usuario === "object" ? r.usuario._id : r.usuario;
      return recipeUserId === currentUser._id;
    });
  });

  totalRecipes = computed(() => this.ownRecipes().length);
  
  totalIngredients = computed(() => {
    const allIngredients = this.ownRecipes().flatMap(r => r.ingredientes);
    const unique = new Set(allIngredients.map(i => i.toLowerCase().trim()));
    return unique.size;
  });

  filteredRecipes = computed(() => {
    let filtered = this.recipes();
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    const onlyFavs = this.showOnlyFavorites();
    const tab = this.activeTab();
    const currentUser = this.authService.getUser();

    // 1. Filter by Tab (Mine vs Public of other users)
    if (currentUser) {
      if (tab === "mine") {
        filtered = filtered.filter(r => {
          const recipeUserId = typeof r.usuario === "object" ? r.usuario._id : r.usuario;
          return recipeUserId === currentUser._id;
        });
      } else {
        // public - show recipes that are public and NOT ours
        filtered = filtered.filter(r => {
          const recipeUserId = typeof r.usuario === "object" ? r.usuario._id : r.usuario;
          return r.publica && recipeUserId !== currentUser._id;
        });
      }
    }

    // 2. Filter by Category
    if (category !== "Todas") {
      filtered = filtered.filter(r => r.categoria === category);
    }

    // 3. Filter by Favorites (only for own recipes, since favorite state is personal)
    if (onlyFavs && tab === "mine") {
      filtered = filtered.filter(r => r.favorito);
    }

    // 4. Search Filter
    if (query) {
      filtered = filtered.filter(r => 
        r.titulo.toLowerCase().includes(query) || 
        r.descripcion.toLowerCase().includes(query) ||
        r.ingredientes.some(i => i.toLowerCase().includes(query))
      );
    }

    // 5. Sorting
    if (this.sortBy() === "title") {
      filtered = [...filtered].sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else {
      // Sort by recent
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading.set(true);
    this.error.set("");
    const scope = this.activeTab() === "public" ? "public" : undefined;
    
    this.recipeService.getAll(scope).subscribe({
      next: (recipes) => {
        this.recipes.set(recipes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set("Error al cargar las recetas");
        this.toastService.error("No se pudieron cargar las recetas");
        this.loading.set(false);
      }
    });
  }

  changeTab(tab: "mine" | "public"): void {
    this.activeTab.set(tab);
    this.selectedCategory.set("Todas");
    this.showOnlyFavorites.set(false);
    this.loadRecipes();
  }

  isOwner(recipe: Recipe): boolean {
    const currentUser = this.authService.getUser();
    if (!currentUser || !recipe.usuario) return false;
    const recipeUserId = typeof recipe.usuario === "object" ? recipe.usuario._id : recipe.usuario;
    return recipeUserId === currentUser._id;
  }

  getChefName(recipe: Recipe): string {
    if (typeof recipe.usuario === "object" && recipe.usuario.name) {
      return recipe.usuario.name;
    }
    return "Chef Anónimo";
  }

  openRecipeModal(recipe: Recipe): void {
    this.selectedRecipe.set(recipe);
  }

  closeRecipeModal(): void {
    this.selectedRecipe.set(null);
  }

  confirmDelete(recipe: Recipe): void {
    this.recipeToDelete.set(recipe);
  }

  cancelDelete(): void {
    this.recipeToDelete.set(null);
  }

  deleteRecipe(): void {
    const recipe = this.recipeToDelete();
    if (!recipe || !recipe._id) return;
    
    this.recipeService.delete(recipe._id).subscribe({
      next: () => {
        this.recipes.update(list => list.filter(r => r._id !== recipe._id));
        this.recipeToDelete.set(null);
        this.toastService.success("¡Receta eliminada correctamente!");
        if (this.selectedRecipe()?._id === recipe._id) {
          this.closeRecipeModal();
        }
      },
      error: (err) => {
        this.error.set("Error al eliminar la receta");
        this.toastService.error("No se pudo eliminar la receta");
      }
    });
  }

  toggleFavorite(recipe: Recipe, event: Event): void {
    event.stopPropagation(); // Avoid opening the modal
    if (!recipe._id || !this.isOwner(recipe)) return;

    const newFavStatus = !recipe.favorito;
    // Limpiar campos antes de enviar actualización
    const { _id, usuario, createdAt, updatedAt, ...cleanRecipe } = recipe;
    const data = { ...cleanRecipe, favorito: newFavStatus };

    this.recipeService.update(recipe._id, data as Recipe).subscribe({
      next: () => {
        this.recipes.update(list => 
          list.map(r => r._id === recipe._id ? { ...r, favorito: newFavStatus } : r)
        );
        if (newFavStatus) {
          this.toastService.success("¡Añadida a tus recetas favoritas! ❤️");
        } else {
          this.toastService.info("Quitada de favoritas");
        }
      },
      error: (err) => {
        this.toastService.error("Error al actualizar favorito");
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.toastService.success("Sesión cerrada. ¡Vuelve pronto a la cocina!");
  }
}
