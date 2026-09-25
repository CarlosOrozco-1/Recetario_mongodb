import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { RecipeService, Recipe } from "../../services/recipe.service";
import { SocialService, Comment, Review } from "../../services/social.service";
import { ToastService } from "../../services/toast.service";
import { Notifications } from "../notifications/notifications";

@Component({
  selector: "app-dashboard",
  imports: [CommonModule, RouterModule, FormsModule, Notifications],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class Dashboard implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly socialService = inject(SocialService);
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

  modalActiveTab = signal<"ingredients" | "instructions" | "comments" | "reviews">("ingredients");

  selectedRecipe = signal<Recipe | null>(null);
  recipeToDelete = signal<Recipe | null>(null);
  recipeToTogglePublic = signal<Recipe | null>(null);
  isTogglingPublic = signal(false);

  // Modal Social State
  modalComments = signal<Comment[]>([]);
  modalReviews = signal<Review[]>([]);
  newCommentText = signal("");
  newReview = signal({ puntuacion: 0, texto: "" });
  isLoadingComments = signal(false);
  isLoadingReviews = signal(false);
  isSubmittingComment = signal(false);
  isSubmittingReview = signal(false);
  replyingToComment = signal<Comment | null>(null);
  replyText = signal("");

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

  isCommentOwner(comment: Comment): boolean {
    const currentUser = this.authService.getUser();
    if (!currentUser || !comment.usuario) return false;
    return comment.usuario._id === currentUser._id;
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
    this.recipeService.update(recipe._id, { favorito: newFavStatus } as Recipe).subscribe({
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

  // --- VISIBILIDAD ---
  askTogglePublic(recipe: Recipe, event: Event): void {
    event.stopPropagation(); // Avoid opening the detail modal
    if (!this.isOwner(recipe)) return;
    this.recipeToTogglePublic.set(recipe);
  }

  cancelTogglePublic(): void {
    this.recipeToTogglePublic.set(null);
  }

  confirmTogglePublic(): void {
    const recipe = this.recipeToTogglePublic();
    if (!recipe?._id) return;

    const willBePublic = !recipe.publica;
    this.isTogglingPublic.set(true);

    this.recipeService.setPublic(recipe._id, willBePublic).subscribe({
      next: () => {
        this.recipes.update(list =>
          list.map(r => (r._id === recipe._id ? { ...r, publica: willBePublic } : r))
        );
        // Reflejar el cambio si el modal de detalle está abierto
        if (this.selectedRecipe()?._id === recipe._id) {
          this.selectedRecipe.update(r => (r ? { ...r, publica: willBePublic } : r));
        }
        this.recipeToTogglePublic.set(null);
        this.isTogglingPublic.set(false);
        this.toastService.success(
          willBePublic ? "Receta ahora es pública 🔓" : "Receta ahora es privada 🔒"
        );
      },
      error: () => {
        this.isTogglingPublic.set(false);
        this.toastService.error("No se pudo cambiar la visibilidad");
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.toastService.success("Sesión cerrada. ¡Vuelve pronto a la cocina!");
  }

  // --- ACCIONES SOCIALES ---
  toggleLike(recipe: Recipe, event: Event): void {
    event.stopPropagation();
    if (!recipe._id) return;
    
    // No permitir like a propia receta
    if (this.isOwner(recipe)) {
      this.toastService.warning("No puedes dar like a tu propia receta. Usa 'Guardar' para tus favoritas.");
      return;
    }
    
    this.recipeService.toggleLike(recipe._id).subscribe({
      next: (res) => {
        this.recipes.update(list => 
          list.map(r => r._id === recipe._id ? { ...r, liked: res.liked, likesCount: res.likesCount } : r)
        );
        this.toastService.success(res.liked ? "¡Te gusta esta receta! ❤️" : "Like quitado");
      },
      error: () => this.toastService.error("Error al dar like")
    });
  }

  toggleSave(recipe: Recipe, event: Event): void {
    event.stopPropagation();
    if (!recipe._id) return;
    this.recipeService.toggleSave(recipe._id).subscribe({
      next: (res) => {
        this.recipes.update(list => 
          list.map(r => r._id === recipe._id ? { ...r, saved: res.saved, guardadosCount: res.guardadosCount } : r)
        );
        this.toastService.success(res.saved ? "¡Receta guardada! 🔖" : "Guardado quitado");
      },
      error: () => this.toastService.error("Error al guardar")
    });
  }

  incrementShare(recipe: Recipe, event: Event): void {
    event.stopPropagation();
    if (!recipe._id) return;
    this.recipeService.incrementShare(recipe._id).subscribe({
      next: (res) => {
        this.recipes.update(list => 
          list.map(r => r._id === recipe._id ? { ...r, compartidosCount: res.compartidosCount } : r)
        );
        this.toastService.success("¡Receta compartida! 🔗");
      },
      error: () => this.toastService.error("Error al compartir")
    });
  }

  // --- MODAL SOCIAL METHODS ---
  openRecipeModal(recipe: Recipe): void {
    this.selectedRecipe.set(recipe);
    this.loadComments(recipe._id!);
    this.loadReviews(recipe._id!);
    this.newCommentText.set("");
    this.newReview.set({ puntuacion: 0, texto: "" });
  }

  loadComments(recipeId: string): void {
    this.isLoadingComments.set(true);
    this.socialService.getCommentsByRecipe(recipeId).subscribe({
      next: (comments) => {
        this.modalComments.set(comments);
        this.isLoadingComments.set(false);
      },
      error: () => {
        this.toastService.error("Error cargando comentarios");
        this.isLoadingComments.set(false);
      }
    });
  }

  loadReviews(recipeId: string): void {
    this.isLoadingReviews.set(true);
    this.socialService.getReviewsByRecipe(recipeId).subscribe({
      next: (reviews) => {
        this.modalReviews.set(reviews);
        this.isLoadingReviews.set(false);
      },
      error: () => {
        this.toastService.error("Error cargando reseñas");
        this.isLoadingReviews.set(false);
      }
    });
  }

  submitComment(): void {
    const recipe = this.selectedRecipe();
    const text = this.newCommentText().trim();
    if (!recipe?._id || !text) return;

    this.isSubmittingComment.set(true);
    this.socialService.createComment({ texto: text, receta: recipe._id }).subscribe({
      next: (comment) => {
        this.modalComments.update(list => [comment, ...list]);
        this.newCommentText.set("");
        this.isSubmittingComment.set(false);
        this.toastService.success("Comentario publicado");
      },
      error: () => {
        this.toastService.error("Error publicando comentario");
        this.isSubmittingComment.set(false);
      }
    });
  }

  startReply(comment: Comment): void {
    this.replyingToComment.set(comment);
    this.replyText.set("");
  }

  cancelReply(): void {
    this.replyingToComment.set(null);
    this.replyText.set("");
  }

  submitReply(): void {
    const recipe = this.selectedRecipe();
    const parent = this.replyingToComment();
    const text = this.replyText().trim();
    if (!recipe?._id || !parent || !text) return;

    this.isSubmittingComment.set(true);
    this.socialService.createComment({ texto: text, receta: recipe._id, parentComment: parent._id }).subscribe({
      next: (reply) => {
        this.modalComments.update(list => list.map(c => 
          c._id === parent._id ? { ...c, replies: [...(c.replies || []), reply] } : c
        ));
        this.cancelReply();
        this.isSubmittingComment.set(false);
        this.toastService.success("Respuesta publicada");
      },
      error: () => {
        this.toastService.error("Error publicando respuesta");
        this.isSubmittingComment.set(false);
      }
    });
  }

  setRating(stars: number): void {
    this.newReview.update(r => ({ ...r, puntuacion: stars }));
  }

  submitReview(): void {
    const recipe = this.selectedRecipe();
    const { puntuacion, texto } = this.newReview();
    if (!recipe?._id || puntuacion === 0) {
      this.toastService.error("Selecciona una puntuación");
      return;
    }

    this.isSubmittingReview.set(true);
    this.socialService.createReview({ puntuacion, texto, receta: recipe._id }).subscribe({
      next: (review) => {
        this.modalReviews.update(list => [review, ...list]);
        // Actualizar rating en la receta
        const currentRecipe = this.selectedRecipe();
        if (currentRecipe?._id) {
          this.selectedRecipe.set({
            ...currentRecipe,
            ratingPromedio: review.puntuacion, // se recalcula en backend
            ratingCount: (currentRecipe.ratingCount || 0) + 1
          });
        }
        this.newReview.set({ puntuacion: 0, texto: "" });
        this.isSubmittingReview.set(false);
        this.toastService.success("¡Reseña publicada! ⭐");
      },
      error: (err) => {
        this.toastService.error(err.error?.message || "Error publicando reseña");
        this.isSubmittingReview.set(false);
      }
    });
  }

  getStarClass(star: number, review?: Review): string {
    const rating = review?.puntuacion ?? this.newReview().puntuacion;
    return star <= rating ? 'filled' : '';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "ahora";
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }
}
