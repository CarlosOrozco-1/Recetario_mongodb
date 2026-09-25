import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

export interface Recipe {
  _id?: string;
  titulo: string;
  descripcion: string;
  ingredientes: string[];
  instrucciones: string;
  imagen?: string;
  usuario?: string | { _id: string; name: string; avatar?: string };
  categoria?: string;
  tiempoPreparacion?: number;
  dificultad?: "Fácil" | "Media" | "Difícil";
  porciones?: number;
  favorito?: boolean;
  publica?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // --- CAMPOS SOCIALES ---
  likes?: string[];
  likesCount?: number;
  liked?: boolean;           // Estado del usuario actual
  guardados?: string[];
  guardadosCount?: number;
  saved?: boolean;           // Estado del usuario actual
  comentariosCount?: number;
  ratingPromedio?: number;
  ratingCount?: number;
  compartidosCount?: number;
  hashtags?: string[];
  reportado?: boolean;
  reportes?: any[];
}

@Injectable({
  providedIn: "root",
})
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = "/api/recipes";

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
  getAll(scope?: string): Observable<Recipe[]> {
    const url = scope ? `${this.apiUrl}?scope=${scope}` : this.apiUrl;
    return this.http.get<Recipe[]>(url, { headers: this.getHeaders() });
  }
  getById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
  create(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe, {
      headers: this.getHeaders(),
    });
  }
  update(id: string, recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, recipe, {
      headers: this.getHeaders(),
    });
  }
  delete(id: string): Observable<Recipe> {
    return this.http.delete<Recipe>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
  uploadImage(id: string, file: File): Observable<Recipe> {
    const formData = new FormData();
    formData.append("imagen", file);
    return this.http.post<Recipe>(`${this.apiUrl}/${id}/image`, formData, {
      headers: this.getHeaders()
    });
  }

  setPublic(id: string, publica: boolean): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, { publica }, {
      headers: this.getHeaders()
    });
  }

  // --- ACCIONES SOCIALES ---
  toggleLike(id: string): Observable<{ liked: boolean; likesCount: number }> {
    return this.http.post<{ liked: boolean; likesCount: number }>(
      `${this.apiUrl}/${id}/like`, {}, { headers: this.getHeaders() }
    );
  }
  toggleSave(id: string): Observable<{ saved: boolean; guardadosCount: number }> {
    return this.http.post<{ saved: boolean; guardadosCount: number }>(
      `${this.apiUrl}/${id}/save`, {}, { headers: this.getHeaders() }
    );
  }
  incrementShare(id: string): Observable<{ compartidosCount: number }> {
    return this.http.post<{ compartidosCount: number }>(
      `${this.apiUrl}/${id}/share`, {}, { headers: this.getHeaders() }
    );
  }
  reportRecipe(id: string, motivo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/report`, { motivo }, { headers: this.getHeaders() });
  }
}
