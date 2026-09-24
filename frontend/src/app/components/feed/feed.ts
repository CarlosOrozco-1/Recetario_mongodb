import { Component, inject, OnInit, signal, computed, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { SocialService, Activity } from "../../services/social.service";
import { ToastService } from "../../services/toast.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-feed",
  imports: [CommonModule, RouterModule],
  templateUrl: "./feed.html",
  styleUrl: "./feed.css",
})
export class Feed implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly socialService = inject(SocialService);
  private readonly toastService = inject(ToastService);

  activities = signal<Activity[]>([]);
  loading = signal(false);
  loadingMore = signal(false);
  error = signal("");
  page = signal(1);
  hasMore = signal(true);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadFeed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeed(reset = false): void {
    if (this.loading() || this.loadingMore()) return;
    
    if (reset) {
      this.page.set(1);
      this.activities.set([]);
      this.hasMore.set(true);
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    const currentPage = this.page();
    this.socialService.getMyFeed(currentPage, 20).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (newActivities) => {
        if (reset) {
          this.activities.set(newActivities);
        } else {
          this.activities.update(current => [...current, ...newActivities]);
        }
        
        this.hasMore.set(newActivities.length === 20);
        this.page.update(p => p + 1);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: (err) => {
        this.error.set("Error cargando feed");
        this.toastService.error("Error cargando feed");
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollPosition = target.scrollTop + target.clientHeight;
    const scrollHeight = target.scrollHeight;
    
    // Load more when 80% scrolled
    if (scrollPosition >= scrollHeight * 0.8 && this.hasMore() && !this.loadingMore()) {
      this.loadFeed();
    }
  }

  refreshFeed(): void {
    this.loadFeed(true);
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

  getActivityIcon(tipo: string): string {
    const icons: Record<string, string> = {
      "creo_receta": "🍳",
      "comento_receta": "💬",
      "reseno_receta": "⭐",
      "likio_receta": "❤️",
      "guardo_receta": "🔖",
      "siguio_usuario": "👥",
      "compartio_receta": "🔗",
    };
    return icons[tipo] || "📝";
  }

  getActivityText(activity: Activity): string {
    const userName = activity.usuario?.name || "Alguien";
    const recipeTitle = activity.metadata?.recetaTitulo || "una receta";
    
    switch (activity.tipo) {
      case "creo_receta":
        return `${userName} creó la receta "${recipeTitle}"`;
      case "comento_receta":
        return `${userName} comentó en "${recipeTitle}"`;
      case "reseno_receta":
        return `${userName} reseñó "${recipeTitle}"`;
      case "likio_receta":
        return `${userName} dio like a "${recipeTitle}"`;
      case "guardo_receta":
        return `${userName} guardó "${recipeTitle}"`;
      case "siguio_usuario":
        return `${userName} empezó a seguir a ${activity.metadata?.autorNombre || "a alguien"}`;
      case "compartio_receta":
        return `${userName} compartió "${recipeTitle}"`;
      default:
        return `${userName} realizó una actividad`;
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  trackByActivityId(index: number, activity: Activity): string {
    return activity._id;
  }
}