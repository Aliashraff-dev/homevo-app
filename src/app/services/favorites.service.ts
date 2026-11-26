import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  favCount = signal(0);

  constructor() {
    this.favCount.set(this.getFavorites().length);
  }

  getFavorites(): any[] {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  }

  addToFavorites(product: any) {
    let favorites = this.getFavorites();
    const existing = favorites.find((item: any) => item.id === product.id);
    if (!existing) {
      favorites.push(product);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      this.favCount.set(favorites.length);
      return true;
    }
    return false;
  }

  removeFromFavorites(productId: number) {
    let favorites = this.getFavorites();
    favorites = favorites.filter((item: any) => item.id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    this.favCount.set(favorites.length);
  }

  isFavorite(productId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some((item: any) => item.id === productId);
  }
}