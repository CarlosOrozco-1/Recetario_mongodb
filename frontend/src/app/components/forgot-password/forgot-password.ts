import { Component, inject, signal } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-forgot-password",
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./forgot-password.html",
  styleUrl: "./forgot-password.css",
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  step = signal<1 | 2 | 3>(1);
  email = "";
  code = "";
  password = "";
  confirmPassword = "";
  resetToken = "";
  error = "";
  success = "";
  loading = signal(false);

  async requestReset(): Promise<void> {
    this.error = "";
    this.success = "";
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.authService.requestPasswordReset(this.email));
      this.success = res.message;
      this.step.set(2);
    } catch (error) {
      this.error = this.serverMessage(error) ?? "No se pudo procesar la solicitud. Intenta de nuevo.";
    } finally {
      this.loading.set(false);
    }
  }

  async verifyCode(): Promise<void> {
    this.error = "";
    this.success = "";
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.authService.verifyResetCode(this.email, this.code));
      this.resetToken = res.resetToken;
      this.step.set(3);
    } catch (error) {
      this.error = this.serverMessage(error) ?? "Código inválido o expirado.";
    } finally {
      this.loading.set(false);
    }
  }

  async resetPassword(): Promise<void> {
    this.error = "";
    this.success = "";
    if (this.password !== this.confirmPassword) {
      this.error = "Las contraseñas no coinciden.";
      return;
    }
    if (this.password.length < 8) {
      this.error = "La contraseña debe tener al menos 8 caracteres.";
      return;
    }
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.authService.resetPassword(this.resetToken, this.password));
      this.success = res.message;
      setTimeout(() => this.router.navigate(["/login"]), 2000);
    } catch (error) {
      this.error = this.serverMessage(error) ?? "No se pudo restablecer la contraseña. El enlace puede haber expirado.";
    } finally {
      this.loading.set(false);
    }
  }

  // Muestra el mensaje del backend cuando existe (por ejemplo, SMTP no disponible)
  // en lugar de ocultarlo detrás de un texto genérico.
  private serverMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse && typeof error.error?.message === "string") {
      return error.error.message;
    }
    return null;
  }

  goBack(): void {
    if (this.step() > 1) {
      this.step.update((s) => (s - 1) as 1 | 2 | 3);
      this.error = "";
      this.success = "";
    }
  }
}
