import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { RecipeService, Recipe } from "../../services/recipe.service";
import { SocialService, FollowUser } from "../../services/social.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-profile",
  imports: [CommonModule, RouterModule],
  templateUrl: "./profile.html",
  styleUrl: "./profile.css",
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly recipeService = inject(RecipeService);
  private readonly socialService = inject(SocialService);
  private readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // State
  profileUser = signal<FollowUser | null>(null);
  userRecipes = signal<Recipe[]>([]);
  loading = signal(true);
  error = signal("");
  activeTab = signal<"recipes" | "favorites" | "activity">("recipes");
  isOwnProfile = signal(false);
  isFollowing = signal(false);
  checkingFollow = signal(false);

  // Current user
  currentUser = computed(() => this.authService.getUser());

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get("username");
      if (username) {
        this.loadProfile(username);
      }
    });
  }

  loadProfile(username: string): void {
    this.loading.set(true);
    this.error.set("");

    // Get user profile
    this.socialService.getUserActivity(username).subscribe({
      next: (activities) => {
        // Extract user info from first activity or fetch separately
        // For now, we'll get user from auth if it's own profile
        this.checkIfOwnProfile(username);
      },
      error: () => {
        this.error.set("Error cargando perfil");
        this.loading.set(false);
      }
    });

    // Load user's recipes
    this.recipeService.getAll().subscribe({
      next: (recipes) => {
        // Filter by user - we need to match by name since we don't have user ID in URL
        const userRecipes = recipes.filter(r => {
          const recipeUser = typeof r.usuario === "object" ? r.usuario.name : "";
          return recipeUser === username;
        });
        this.userRecipes.set(userRecipes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Error cargando recetas");
        this.loading.set(false);
      }
    });

    // Check follow status
    this.checkFollowStatus(username);
  }

  checkIfOwnProfile(username: string): void {
    const current = this.currentUser();
    if (current && current.name === username) {
      this.isOwnProfile.set(true);
    }
  }

  checkFollowStatus(username: string): void {
    const current = this.currentUser();
    if (!current || this.isOwnProfile()) return;

    this.checkingFollow.set(true);
    this.socialService.checkFollow(username).subscribe({
      next: (res) => {
        this.isFollowing.set(res.isFollowing);
        this.checkingFollow.set(false);
      },
      error: () => this.checkingFollow.set(false)
    });
  }

  toggleFollow(): void {
    const profile = this.profileUser();
    if (!profile?._id) return;

    this.socialService.toggleFollow(profile._id).subscribe({
      next: (res) => {
        this.isFollowing.set(res.isFollowing);
        this.toastService.success(res.isFollowing ? "¡Ahora sigues a este chef!" : "Dejaste de seguir");
      },
      error: () => this.toastService.error("Error al seguir")
    });
  }

  changeTab(tab: "recipes" | "favorites" | "activity"): void {
    this.activeTab.set(tab);
  }

  openRecipeModal(recipe: Recipe): void {
    // Reuse dashboard's modal or navigate to detail
    // For now, we'll implement a simple view
  }

  onLogout(): void {
    this.authService.logout();
    this.toastService.success("Sesión cerrada");
  }
}