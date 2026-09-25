import { Component, inject, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { RecipeService, Recipe } from "../../services/recipe.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-recipe-form",
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./recipe-form.html",
  styleUrl: "./recipe-form.css",
})
export class RecipeForm implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  recipe: Recipe = {
    titulo: "",
    descripcion: "",
    ingredientes: [""],
    instrucciones: "",
    imagen: "",
    categoria: "Plato Principal",
    tiempoPreparacion: 20,
    dificultad: "Media",
    porciones: 2,
    publica: false,
    favorito: false,
  };

  isEdit = false;
  id = "";
  error = "";

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get("id");
      console.log("Formulario de receta cargado. ID detectado:", id);
      if (id) {
        this.isEdit = true;
        this.id = id;
        this.loadRecipe(id);
      } else {
        this.isEdit = false;
        this.id = "";
        this.recipe = {
          titulo: "",
          descripcion: "",
          ingredientes: [""],
          instrucciones: "",
          imagen: "",
          categoria: "Plato Principal",
          tiempoPreparacion: 20,
          dificultad: "Media",
          porciones: 2,
          publica: false,
          favorito: false,
        };
      }
    });
  }

  loadRecipe(id: string): void {
    console.log("Obteniendo receta desde el servicio para ID:", id);
    this.recipeService.getById(id).subscribe({
next: (data) => {
        console.log("Datos recibidos del backend:", data);
        this.recipe = {
          ...data,
          categoria: data.categoria || "Plato Principal",
          tiempoPreparacion: data.tiempoPreparacion ?? 20,
          dificultad: data.dificultad || "Media",
          porciones: data.porciones ?? 2,
          publica: data.publica ?? false,
          favorito: data.favorito ?? false,
          ingredientes: data.ingredientes && data.ingredientes.length > 0
            ? [...data.ingredientes]
            : [""],
        };
        console.log("Modelo de receta asignado en el formulario:", this.recipe);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al cargar la receta desde la API:", err);
        this.error = "Error al cargar la receta";
        this.toastService.error("No se pudo cargar la receta");
      }
    });
  }

  onAddIngrediente(): void {
    this.recipe.ingredientes.push("");
  }

  trackByIndex(index: number): number {
    return index;
  }

  onRemoveIngrediente(index: number): void {
    this.recipe.ingredientes.splice(index, 1);
  }

  onSubmit(): void {
    this.error = "";
    const ingredientes = this.recipe.ingredientes.filter(
      (i) => i.trim() !== "",
    );
    if (ingredientes.length === 0) {
      this.error = "Agrega al menos un ingrediente";
      this.toastService.error("Debes agregar al menos un ingrediente");
      return;
    }

    // Destructurar y limpiar campos de metadata generados por MongoDB/Mongoose
    // para evitar errores de validación de esquemas (CastError) en el backend.
    const { _id, usuario, createdAt, updatedAt, ...cleanRecipe } = this.recipe;
    const data = { ...cleanRecipe, ingredientes };
    
    console.log("Enviando datos al backend para guardar:", data);

    const request$ = this.isEdit 
      ? this.recipeService.update(this.id, data) 
      : this.recipeService.create(data);

    request$.subscribe({
      next: () => {
        if (this.isEdit) {
          this.toastService.success("¡Receta actualizada con éxito!");
        } else {
          this.toastService.success("¡Nueva receta creada con éxito!");
        }
        this.router.navigate(["/dashboard"]);
      },
      error: (err) => {
        console.error("Error al guardar la receta en la API:", err);
        this.error = "Error al guardar la receta";
        this.toastService.error("Ocurrió un error al intentar guardar la receta");
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith("image/")) {
      this.toastService.error("Selecciona un archivo de imagen");
      input.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error("La imagen supera el tamaño máximo de 5 MB");
      input.value = "";
      return;
    }

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  removeImage(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = null;
    this.previewUrl = null;
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.id) return;

    const file = this.selectedFile;
    const url = URL.createObjectURL(file);
    const probe = new Image();

    probe.onload = () => {
      URL.revokeObjectURL(url);
      // El backend ya no puede leer el buffer (GridFS consume el stream),
      // así que el límite de dimensiones se aplica aquí.
      if (probe.naturalWidth > 1920 || probe.naturalHeight > 1080) {
        this.toastService.warning(
          `La imagen mide ${probe.naturalWidth}x${probe.naturalHeight}px. Se subirá igual, pero se verá mejor si no supera 1920x1080.`
        );
      }
      this.sendImage(file);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      this.toastService.error("No se pudo leer la imagen seleccionada");
    };
    probe.src = url;
  }

  private sendImage(file: File): void {
    if (!this.id) return;
    this.recipeService.uploadImage(this.id, file).subscribe({
      next: (recipe) => {
        this.recipe = { ...this.recipe, imagen: recipe.imagen };
        this.toastService.success("Imagen subida correctamente");
      },
      error: (err) =>
        this.toastService.error(err.error?.message || "Error subiendo imagen")
    });
  }
}
