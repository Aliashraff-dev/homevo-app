import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './collection.html',
  styleUrls: ['./collection.css']
})
export class CollectionComponent implements OnInit {
  activeFilter = 'ALL';
  searchQuery = '';
  private pendingCategory: string | null = null;

  // قيم فلتر السعر الافتراضية المطلوبة
  minPrice: number = 100;
  maxPrice: number = 1000;

  filters: string[] = ['ALL', 'LIVING ROOM', 'BEDROOM', 'OFFICE', 'OUTDOOR'];

  // المصفوفة كاملة تحتوي على الـ 12 منتج الأصليين + الـ 6 منتجات الجديدة بالصور المستدعاة
  products = [
    { id: 1, name: 'Olive Crest Lounge Chair', price: 420, image: '/product-1-olive.png', category: 'LIVING ROOM' },
    { id: 2, name: 'Ivory Haven Armchair', price: 360, image: '/product-2-ivory.png', category: 'LIVING ROOM' },
    { id: 3, name: 'Oak Nest Accent Chair', price: 310, image: '/product-3-oak.png', category: 'LIVING ROOM' },
    { id: 4, name: 'Cloud Ease Chair', price: 260, image: '/product-4-cloud.png', category: 'BEDROOM' },
    { id: 5, name: 'Amber Loop Chair', price: 330, image: '/product-5-amber.png', category: 'OFFICE' },
    { id: 6, name: 'Sage Frame Armchair', price: 295, image: '/product-6-sage.png', category: 'OUTDOOR' },

    { id: 7, name: "Nordic Chair", image: "/chair-nordic.png", price: 420, category: 'LIVING ROOM' },
    { id: 8, name: "Amber Chair", image: "/chair-amber.png", price: 650, category: 'LIVING ROOM' },
    { id: 9, name: "Ivory Chair", image: "/chair-ivory.png", price: 340, category: 'BEDROOM' },
    { id: 10, name: "Espresso Chair", image: "/chair-espresso.png", price: 790, category: 'OFFICE' },
    { id: 11, name: "Forest Chair", image: "/chair-forest.png", price: 520, category: 'OUTDOOR' },
    { id: 12, name: "Stone Chair", image: "/chair-stone.png", price: 470, category: 'LIVING ROOM' },

    // الـ 6 منتجات المضافة بالصور الستة التي لم تُستخدم (من 13 إلى 18)
    { id: 13, name: 'Velvet Lounge Chair', price: 380, image: '/chair-1.jpg', category: 'LIVING ROOM' },
    { id: 14, name: 'Modern Minimalist Chair', price: 290, image: '/chair-2.jpg', category: 'LIVING ROOM' },
    { id: 15, name: 'Cozy Accent Armchair', price: 310, image: '/chair-3.jpg', category: 'BEDROOM' },
    { id: 16, name: 'Executive Swivel Chair', price: 450, image: '/chair-4.jpg', category: 'OFFICE' },
    { id: 17, name: 'Rustic Patio Chair', price: 270, image: '/chair-5.jpg', category: 'OUTDOOR' },
    { id: 18, name: 'Classic Studio Chair', price: 340, image: '/chair-6.jpg', category: 'LIVING ROOM' }
  ];

  constructor(
    private route: ActivatedRoute,
    private favoritesService: FavoritesService,
    private cartService: CartService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategoriesFromApi();
    this.loadProductsFromApi();

    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      if (params['category']) {
        this.pendingCategory = params['category'].toString().trim().toUpperCase();
        this.applyPendingCategory();
      }
    });
  }

  loadCategoriesFromApi() {
    this.http.get<any[]>(`${environment.apiBaseUrl}/Categories`).subscribe({
      next: (cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          const apiNames = cats
            .map(c => (c.name || '').toString().trim().toUpperCase())
            .filter(name => name.length > 0);
          this.filters = ['ALL', ...Array.from(new Set(apiNames))];
          this.applyPendingCategory();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load collection categories:', err);
      }
    });
  }


  loadProductsFromApi() {
    this.http.get<any[]>(`${environment.apiBaseUrl}/Products?pageSize=100`).subscribe({
      next: (apiProducts) => {
        const list = Array.isArray(apiProducts) ? apiProducts : ((apiProducts as any)?.items || (apiProducts as any)?.data || []);
        if (!Array.isArray(list) || list.length === 0) return;

        const existingIds = new Set(this.products.map(p => p.id));
        const normalizedApiProducts = list.map((item: any) => ({
          id: item.id,
          name: item.name || "",
          price: Number(item.price) || 0,
          image: item.imageUrl || item.image || "/chair-1.jpg",
          category: ((item.categoryName || item.category?.name || item.category || "LIVING ROOM") + "").trim().toUpperCase()
        }));

        const uniqueNew = normalizedApiProducts.filter(p => !existingIds.has(p.id));
        this.products = [...this.products, ...uniqueNew];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Failed to load collection products:", err);
      }
    });
  }

  get filteredProducts() {
    return this.products.filter(p => {
      const matchFilter = this.activeFilter === 'ALL' || (p.category || '').toUpperCase() === this.activeFilter.toUpperCase();
      const matchSearch = (p.name || '').toLowerCase().includes((this.searchQuery || '').toLowerCase());
      const matchPrice = p.price >= this.minPrice && p.price <= this.maxPrice;

      return matchFilter && matchSearch && matchPrice;
    });
  }

  isFavorite(productId: number): boolean {
    return this.favoritesService.isFavorite(productId);
  }

  toggleFavorite(product: any) {
    if (this.favoritesService.isFavorite(product.id)) {
      this.favoritesService.removeFromFavorites(product.id);
    } else {
      this.favoritesService.addToFavorites(product);
    }
  }

  private applyPendingCategory() {
    if (!this.pendingCategory) return;
    const match = this.filters.find(f => f.toUpperCase() === this.pendingCategory);
    if (match) {
      this.activeFilter = match;
      this.pendingCategory = null;
      this.cdr.detectChanges();
    }
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}