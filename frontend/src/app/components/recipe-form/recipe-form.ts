import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { RecipeService, Recipe } from "../../services/recipe.service";

@Component({
  selector: "app-recipe-form",
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./recipe-form.html",
  styleUrl: "./recipe-form.css",
})
export class RecipeForm implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  recipe: Recipe = {
    titulo: "",
    descripcion: "",
    ingredientes: [""],
    instrucciones: "",
    imagen: "",
  };

  isEdit = false;
  id = "";
  error = "";

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEdit = true;
      this.id = id;
      this.loadRecipe(id);
    }
  }

  async loadRecipe(id: string): Promise<void> {
    try {
      this.recipe = await firstValueFrom(this.recipeService.getById(id));
    } catch (err: unknown) {
      this.error = "Error al cargar la receta";
    }
  }

  onAddIngrediente(): void {
    this.recipe.ingredientes.push("");
  }

  onRemoveIngrediente(index: number): void {
    this.recipe.ingredientes.splice(index, 1);
  }

  async onSubmit(): Promise<void> {
    this.error = "";
    try {
      const ingredientes = this.recipe.ingredientes.filter(
        (i) => i.trim() !== "",
      );
      const data = { ...this.recipe, ingredientes };

      if (this.isEdit) {
        await firstValueFrom(this.recipeService.update(this.id, data));
      } else {
        await firstValueFrom(this.recipeService.create(data));
      }
      this.router.navigate(["/dashboard"]);
    } catch (err: unknown) {
      this.error = "Error al guardar la receta";
    }
  }
}
