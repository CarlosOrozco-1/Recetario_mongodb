import { Component, inject } from "@angular/core";
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

  async onLogin(): Promise<void> {
    this.error = "";
    try {
      await firstValueFrom(this.authService.login(this.email, this.password));
      this.router.navigate(["/dashboard"]);
    } catch (err: unknown) {
      this.error = "Credenciales incorrectas";
    }
  }
}
