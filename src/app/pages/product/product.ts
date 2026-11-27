import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './product.html',
  styleUrls: ['./product.css']
})
export class ProductComponent implements OnInit {
  product: any = null;

  // القائمة الكاملة محتوية على الـ 18 منتج بالكامل
  allProducts = [
    { id: 1, name: 'Olive Crest Lounge Chair', price: 420, image: 'product-1-olive.png', description: 'A stunning lounge chair crafted from premium olive-toned fabric with solid wood legs.' },
    { id: 2, name: 'Ivory Haven Armchair', price: 360, image: 'product-2-ivory.png', description: 'Elegant ivory armchair designed for maximum comfort and modern aesthetics.' },
    { id: 3, name: 'Oak Nest Accent Chair', price: 310, image: 'product-3-oak.png', description: 'A beautiful accent chair with oak frame and soft cushioning.' },
    { id: 4, name: 'Cloud Ease Chair', price: 260, image: 'product-4-cloud.png', description: 'Ultra-soft cloud-like chair perfect for relaxing after a long day.' },
    { id: 5, name: 'Amber Loop Chair', price: 330, image: 'product-5-amber.png', description: 'Modern amber-toned looping chair with a unique contemporary design.' },
    { id: 6, name: 'Sage Frame Armchair', price: 295, image: 'product-6-sage.png', description: 'A sage green armchair with slim frame and premium upholstery.' },
    
    { id: 7, name: 'Nordic Chair', price: 420, image: 'chair-nordic.png', description: 'Minimalist Nordic design chair featuring sleek lines and premium structural support.' },
    { id: 8, name: 'Amber Chair', price: 650, image: 'chair-amber.png', description: 'Luxurious amber-accented statement chair that blends rich tones with high-end comfort.' },
    { id: 9, name: 'Ivory Chair', price: 340, image: 'chair-ivory.png', description: 'Sophisticated ivory accent chair, crafted to bring a touch of bright luxury into your space.' },
    { id: 10, name: 'Espresso Chair', price: 790, image: 'chair-espresso.png', description: 'Deep espresso dark wood tones mixed with luxury upholstery for the ultimate executive feel.' },
    { id: 11, name: 'Forest Chair', price: 520, image: 'chair-forest.png', description: 'Organic forest green tones meet modern architecture in this deeply comfortable armchair.' },
    { id: 12, name: 'Stone Chair', price: 470, image: 'chair-stone.png', description: 'A solid, elegant stone-gray chair designed to complement clean, contemporary interiors.' },

    // إضافة الـ 6 منتجات الجديدة بـ IDs من 13 إلى 18
    { id: 13, name: 'Velvet Lounge Chair', price: 380, image: 'chair-1.jpg', description: 'A luxurious velvet lounge chair that combines ultra-plush comfort with timeless elegance.' },
    { id: 14, name: 'Modern Minimalist Chair', price: 290, image: 'chair-2.jpg', description: 'Sleek, minimal, and modern armchair designed for clean interior spaces.' },
    { id: 15, name: 'Cozy Accent Armchair', price: 310, image: 'chair-3.jpg', description: 'A cozy accent chair built for reading nooks and warm bedroom interiors.' },
    { id: 16, name: 'Executive Swivel Chair', price: 450, image: 'chair-4.jpg', description: 'Premium executive seating offering ergonomic back support and high-end styling.' },
    { id: 17, name: 'Rustic Patio Chair', price: 270, image: 'chair-5.jpg', description: 'Weather-resistant rustic outdoor chair perfect for patios and green gardens.' },
    { id: 18, name: 'Classic Studio Chair', price: 340, image: 'chair-6.jpg', description: 'Versatile studio chair crafted with durable frame and soft studio upholstery.' }
  ];

  constructor(private route: ActivatedRoute, private cartService: CartService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const paramMap = this.route.snapshot.queryParamMap;
    const id = Number(paramMap.get('id'));
    
    const found = this.allProducts.find(p => p.id === id);

    if (found) {
      this.product = found;
    } else if (paramMap.get('name')) {
      // آمان إضافي: لقراءة بيانات المنتج مباشرة من الـ Query Params لو لم يُعثر عليه بالـ ID
      this.product = {
        id: id || 999,
        name: paramMap.get('name'),
        price: Number(paramMap.get('price')) || 0,
        image: paramMap.get('image')?.replace(/^\//, '') || 'hero-chair.png',
        description: 'A stylish and modern piece designed for comfort and durability in any home space.'
      };
    } else {
      this.product = this.allProducts[0];
    }

    this.syncProductFromApi(id, paramMap.get('name'));
  }

  private syncProductFromApi(requestedId: number, requestedName: string | null) {
    this.http.get<any>(`${environment.apiBaseUrl}/Products?pageSize=200`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.items || res?.data || []);
        if (!Array.isArray(list) || list.length === 0) return;

        const targetName = String(requestedName || this.product?.name || "").trim().toLowerCase();
        const matched =
          list.find((item: any) => Number(item?.id ?? item?.Id) === requestedId && requestedId > 0) ||
          list.find((item: any) => String(item?.name ?? item?.Name ?? "").trim().toLowerCase() === targetName && targetName.length > 0);

        if (matched) {
          this.product = {
            ...this.product,
            id: Number(matched.id ?? matched.Id) || this.product?.id,
            name: matched.name ?? matched.Name ?? this.product?.name,
            price: Number(matched.price ?? matched.Price) ?? this.product?.price,
            image: matched.imageUrl ?? matched.image ?? this.product?.image,
            description: matched.description ?? matched.Description ?? this.product?.description
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Failed to sync product details from API:", err);
      }
    });
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product);
    }
  }
}