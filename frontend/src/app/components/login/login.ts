import { AfterViewInit, Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { environment } from "../../../environments/environment";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

@Component({
  selector: "app-login",
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
})
export class Login implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly googleClientId = environment.googleClientId;

  email = "";
  password = "";
  error = "";
  
  showPassword = signal(false);
  loading = signal(false);
  googleLoading = signal(false);

  ngAfterViewInit(): void {
    if (!this.googleClientId) {
      this.error = "El inicio de sesión con Google no está configurado";
      return;
    }

    const renderGoogleButton = () => {
      const google = window.google;
      const container = document.getElementById("google-signin-button");
      if (!google || !container) return;

      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: response => void this.onGoogleCredential(response.credential),
      });
      google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: Math.min(container.clientWidth || 340, 340),
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const googleScript = document.querySelector<HTMLScriptElement>("script[data-google-identity]");
    if (googleScript) {
      googleScript.addEventListener("load", renderGoogleButton, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset["googleIdentity"] = "true";
    script.addEventListener("load", renderGoogleButton, { once: true });
    script.addEventListener("error", () => {
      this.error = "No se pudo cargar el inicio de sesión con Google";
    }, { once: true });
    document.head.appendChild(script);
  }

  private async onGoogleCredential(credential: string): Promise<void> {
    this.error = "";
    this.googleLoading.set(true);
    try {
      await firstValueFrom(this.authService.loginWithGoogle(credential));
      await this.router.navigate(["/dashboard"]);
    } catch {
      this.error = "No se pudo iniciar sesión con Google. Inténtalo de nuevo.";
    } finally {
      this.googleLoading.set(false);
    }
  }

  togglePassword(): void {
    this.showPassword.update(s => !s);
  }

  async onLogin(): Promise<void> {
    this.error = "";
    this.loading.set(true);
    try {
      await firstValueFrom(this.authService.login(this.email, this.password));
      await this.router.navigate(["/dashboard"]);
    } catch {
      this.error = "Credenciales incorrectas";
    } finally {
      this.loading.set(false);
    }
  }
}
