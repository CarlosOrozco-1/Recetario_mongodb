import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-register",
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./register.html",
  styleUrl: "./register.css",
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  name = "";
  email = "";
  password = "";
  error = "";

  async onRegister(): Promise<void> {
    this.error = "";
    try {
      await firstValueFrom(
        this.authService.register(this.name, this.email, this.password),
      );
      this.router.navigate(["/dashboard"]);
    } catch (err: unknown) {
      this.error = "No se pudo registrar, verifica tus datos";
    }
  }
}
