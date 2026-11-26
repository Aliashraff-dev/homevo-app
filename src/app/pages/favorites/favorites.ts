import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service'; // 1. استيراد خدمة السلة

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];

  // 2. حقن CartService بداخل الـ constructor
  constructor(
    private favoritesService: FavoritesService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favorites = this.favoritesService.getFavorites();
  }

  removeFromFavorites(productId: number) {
    this.favoritesService.removeFromFavorites(productId);
    this.loadFavorites();
  }

  // 3. ربط الدالة بـ CartService وإلغاء الـ alert القديم
  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}