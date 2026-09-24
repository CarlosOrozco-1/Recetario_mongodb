import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

export interface Comment {
  _id: string;
  texto: string;
  usuario: { _id: string; name: string; avatar?: string };
  receta: string;
  parentComment?: string;
  replies?: Comment[];
  createdAt: string;
}

export interface Review {
  _id: string;
  puntuacion: number;
  texto: string;
  usuario: { _id: string; name: string; avatar?: string };
  receta: string;
  createdAt: string;
}

export interface FollowUser {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  stats?: any;
}

export interface Activity {
  _id: string;
  tipo: string;
  usuario: { _id: string; name: string; avatar?: string };
  referencia: { tipo: string; id: string };
  metadata?: any;
  createdAt: string;
}

@Injectable({ providedIn: "root" })
export class SocialService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = "/api";

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  createComment(data: { texto: string; receta: string; parentComment?: string }): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, data, { headers: this.getHeaders() });
  }
  getCommentsByRecipe(recetaId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/receta/${recetaId}`, { headers: this.getHeaders() });
  }
  updateComment(id: string, texto: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${id}`, { texto }, { headers: this.getHeaders() });
  }
  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${id}`, { headers: this.getHeaders() });
  }

  createReview(data: { puntuacion: number; texto: string; receta: string }): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, data, { headers: this.getHeaders() });
  }
  getReviewsByRecipe(recetaId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/receta/${recetaId}`, { headers: this.getHeaders() });
  }
  updateReview(id: string, data: { puntuacion: number; texto: string }): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${id}`, data, { headers: this.getHeaders() });
  }
  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`, { headers: this.getHeaders() });
  }

  toggleFollow(seguidoId: string): Observable<{ isFollowing: boolean }> {
    return this.http.post<{ isFollowing: boolean }>(`${this.apiUrl}/follows`, { seguidoId }, { headers: this.getHeaders() });
  }
  getFollowers(userId: string): Observable<FollowUser[]> {
    return this.http.get<FollowUser[]>(`${this.apiUrl}/follows/followers/${userId}`, { headers: this.getHeaders() });
  }
  getFollowing(userId: string): Observable<FollowUser[]> {
    return this.http.get<FollowUser[]>(`${this.apiUrl}/follows/following/${userId}`, { headers: this.getHeaders() });
  }
  checkFollow(userId: string): Observable<{ isFollowing: boolean }> {
    return this.http.get<{ isFollowing: boolean }>(`${this.apiUrl}/follows/check/${userId}`, { headers: this.getHeaders() });
  }

  getMyFeed(page = 1, limit = 20): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/activity/feed?page=${page}&limit=${limit}`, { headers: this.getHeaders() });
  }
  getUserActivity(userId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/activity/user/${userId}`, { headers: this.getHeaders() });
  }

  toggleLike(recipeId: string): Observable<{ liked: boolean; likesCount: number }> {
    return this.http.post<{ liked: boolean; likesCount: number }>(`${this.apiUrl}/recipes/${recipeId}/like`, {}, { headers: this.getHeaders() });
  }
  toggleSave(recipeId: string): Observable<{ saved: boolean; guardadosCount: number }> {
    return this.http.post<{ saved: boolean; guardadosCount: number }>(`${this.apiUrl}/recipes/${recipeId}/save`, {}, { headers: this.getHeaders() });
  }
  incrementShare(recipeId: string): Observable<{ compartidosCount: number }> {
    return this.http.post<{ compartidosCount: number }>(`${this.apiUrl}/recipes/${recipeId}/share`, {}, { headers: this.getHeaders() });
  }
  reportRecipe(recipeId: string, motivo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recipes/${recipeId}/report`, { motivo }, { headers: this.getHeaders() });
  }
}

export interface Activity {
  _id: string;
  tipo: string;
  usuario: { _id: string; name: string; avatar?: string };
  referencia: { tipo: string; id: string };
  metadata?: any;
  createdAt: string;
}