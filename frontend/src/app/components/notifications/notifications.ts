import { Component, inject, OnInit, signal, computed, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { SocialService, Activity } from "../../services/social.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-notifications",
  imports: [CommonModule, RouterModule],
  templateUrl: "./notifications.html",
  styleUrl: "./notifications.css",
})
export class Notifications implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly socialService = inject(SocialService);
  private readonly toastService = inject(ToastService);

  isOpen = signal(false);
  notifications = signal<Activity[]>([]);
  unreadCount = signal(0);
  loading = signal(false);
  error = signal("");

  ngOnInit(): void {
    this.loadNotifications();
  }

  toggle(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.loadNotifications();
    }
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest(".notifications-dropdown")) {
      this.isOpen.set(false);
    }
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.error.set("");

    this.socialService.getMyFeed(1, 20).subscribe({
      next: (activities) => {
        // Filter only relevant notifications (not own activities)
        const currentUser = this.authService.getUser();
        const filtered = activities.filter(a => 
          a.usuario?._id !== currentUser?._id
        );
        this.notifications.set(filtered);
        this.unreadCount.set(filtered.length); // Simplificado: todas son no leídas
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Error cargando notificaciones");
        this.loading.set(false);
      }
    });
  }

  markAsRead(activity: Activity): void {
    // TODO: Implementar marcar como leída en backend
    this.notifications.update(list => list.filter(n => n._id !== activity._id));
    this.unreadCount.update(c => Math.max(0, c - 1));
  }

  markAllAsRead(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(date.getTime() / 60000);
    const diffHours = Math.floor(date.getTime() / 3600000);
    const diffDays = Math.floor(date.getTime() / 86400000);

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
}