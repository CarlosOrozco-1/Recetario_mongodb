import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./login.html",
  styleUrl: "./login.css",
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = "";
  password = "";
  error = "";
  
  showPassword = signal(false);
  loading = signal(false);

  togglePassword(): void {
    this.showPassword.update(s => !s);
  }

  async onLogin(): Promise<void> {
    this.error = "";
    this.loading.set(true);
    try {
      await firstValueFrom(this.authService.login(this.email, this.password));
      this.router.navigate(["/dashboard"]);
    } catch (err: unknown) {
      this.error = "Credenciales incorrectas";
    } finally {
      this.loading.set(false);
    }
  }
}
