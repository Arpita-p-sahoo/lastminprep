import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models';
import { environment } from '../../../environments/environment';
import { Observable, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = environment.apiUrl;

  myFollowing = signal<User[]>([]);
  myFollowers = signal<User[]>([]);

  constructor(private http: HttpClient) { }

  followUser(id: string): Observable<any> {
    return this.http.post<any>(`${this.API}/users/${id}/follow`, {}).pipe(
      tap(() => this.loadMyFollowing())
    );
  }

  unfollowUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API}/users/${id}/follow`).pipe(
      tap(() => this.loadMyFollowing())
    );
  }

  loadMyFollowing(): void {
    this.http.get<any>(`${this.API}/users/me/following`).pipe(
      map(res => this.normalizeList(res))
    ).subscribe({
      next: users => this.myFollowing.set(users),
      error: () => this.myFollowing.set([])
    });
  }

  loadMyFollowers(): void {
    this.http.get<any>(`${this.API}/users/me/followers`).pipe(
      map(res => this.normalizeList(res))
    ).subscribe({
      next: users => this.myFollowers.set(users),
      error: () => this.myFollowers.set([])
    });
  }

  getUserFollowing(id: string): Observable<User[]> {
    return this.http.get<any>(`${this.API}/users/${id}/following`).pipe(
      map(res => this.normalizeList(res))
    );
  }

  getUserFollowers(id: string): Observable<User[]> {
    return this.http.get<any>(`${this.API}/users/${id}/followers`).pipe(
      map(res => this.normalizeList(res))
    );
  }

  private normalizeList(res: any): User[] {
    const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    return data.map((u: any) => ({
      id: u.id ?? u._id ?? '',
      name: u.name ?? '',
      email: u.email ?? '',
      avatar: u.avatar ?? u.avatarUrl ?? '',
      designation: u.designation ?? '',
      organisation: u.organisation ?? '',
    }));
  }
}
