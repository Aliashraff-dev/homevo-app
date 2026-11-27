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
    try {
      const parsed = JSON.parse(localStorage.getItem('favorites') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveFavorites(favorites: any[]) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    this.favCount.set(favorites.length);
  }

  syncWithProducts(apiProducts: any[]) {
    if (!Array.isArray(apiProducts) || apiProducts.length === 0) return;
    const byId = new Map<number, any>();
    const byName = new Map<string, any>();

    for (const p of apiProducts) {
      if (p?.id !== undefined && p?.id !== null) byId.set(Number(p.id), p);
      if (p?.name) byName.set(String(p.name).trim().toLowerCase(), p);
    }

    let changed = false;
    const updated = this.getFavorites().map((item: any) => {
      const match =
        (item?.id !== undefined && item?.id !== null ? byId.get(Number(item.id)) : undefined) ||
        (item?.name ? byName.get(String(item.name).trim().toLowerCase()) : undefined);

      if (!match) return item;

      const nextId = match.id ?? item.id;
      const nextName = match.name ?? item.name;
      const nextPrice = match.price ?? item.price;
      const nextImage = match.imageUrl || match.image || item.imageUrl || item.image;

      if (
        item.id !== nextId ||
        item.name !== nextName ||
        item.price !== nextPrice ||
        (match.imageUrl || match.image)
      ) {
        changed = true;
      }

      return {
        ...item,
        ...match,
        id: nextId,
        name: nextName,
        price: nextPrice,
        imageUrl: nextImage,
        image: match.image || nextImage
      };
    });

    if (changed) {
      this.saveFavorites(updated);
    }
  }

  addToFavorites(product: any) {
    let favorites = this.getFavorites();
    const existing = favorites.find((item: any) => item.id === product.id);
    if (!existing) {
      favorites.push(product);
      this.saveFavorites(favorites);
      return true;
    }
    return false;
  }

  removeFromFavorites(productId: number) {
    let favorites = this.getFavorites();
    favorites = favorites.filter((item: any) => item.id !== productId);
    this.saveFavorites(favorites);
  }

  isFavorite(productId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some((item: any) => item.id === productId);
  }
}
