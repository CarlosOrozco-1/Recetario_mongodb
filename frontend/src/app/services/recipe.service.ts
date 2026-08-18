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
  usuario?: string | { _id: string; name: string };
  categoria?: string;
  tiempoPreparacion?: number;
  dificultad?: "Fácil" | "Media" | "Difícil";
  porciones?: number;
  favorito?: boolean;
  publica?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
}
