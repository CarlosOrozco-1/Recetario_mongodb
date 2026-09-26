import { Component, inject, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { RecipeService, Recipe } from "../../services/recipe.service";
import { ToastService } from "../../services/toast.service";

/** Lado mayor máximo de la imagen antes de subirla. */
const MAX_IMAGE_EDGE = 1600;
/** Calidad JPEG: 0.8 baja de 3-5 MB a ~250 KB sin que se note en la tarjeta. */
const IMAGE_QUALITY = 0.8;

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
    if (file.size > 25 * 1024 * 1024) {
      this.toastService.error("La imagen supera el tamaño máximo de 25 MB");
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
    const original = this.selectedFile;
    const originalUrl = URL.createObjectURL(original);

    // El plan gratis de Atlas da 500 MB. Un JPEG de 1600px ronda los 250 KB,
    // mientras que una foto de móvil pesa 3-5 MB: sin reescalar, 100 imágenes
    // agotarían el plan. Se redimensiona en el navegador antes de subir.
    this.resizeImage(original)
      .then(({ file, width, height, originalSize }) => {
        URL.revokeObjectURL(originalUrl);

        if (file.size < originalSize) {
          this.selectedFile = file;
          this.previewUrl = URL.createObjectURL(file);
          this.toastService.info(
            `Imagen optimizada: ${this.formatBytes(originalSize)} → ${this.formatBytes(file.size)} (${width}x${height})`
          );
        } else {
          this.toastService.info(
            `La imagen ya era ligera (${width}x${height}, ${this.formatBytes(file.size)}). Se sube sin cambios.`
          );
        }
        this.sendImage(file);
      })
      .catch(() => {
        URL.revokeObjectURL(originalUrl);
        // Si el navegador no deja redimensionar, se sube el original.
        this.sendImage(original);
      });
  }

  private resizeImage(file: File): Promise<{ file: File; width: number; height: number; originalSize: number }> {
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        try {
          const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
          const width = Math.round(image.naturalWidth * scale);
          const height = Math.round(image.naturalHeight * scale);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("no hay contexto 2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(image, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) throw new Error("no se pudo exportar");
              const name = file.name.replace(/\.[^.]+$/, "") || "receta";
              resolve({
                file: new File([blob], `${name}.jpg`, { type: "image/jpeg" }),
                width,
                height,
                originalSize: file.size,
              });
            },
            "image/jpeg",
            IMAGE_QUALITY
          );
        } catch (error) {
          reject(error);
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("no se pudo leer la imagen"));
      };
      image.src = url;
    });
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
