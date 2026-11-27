import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  currentSlide = '01';
  activeCategory = 0;
  activeFilter = 'LIVING ROOM';
  activeAccordion = 0;
  chairOpacity = 1;
  currentChairImage = '/hero-chair.png';

  constructor(
    private cdr: ChangeDetectorRef, 
    private favoritesService: FavoritesService,
    private cartService: CartService,
    private router: Router
  ) {}

  swatches = [
    { color: '#8D4328', image: '/hero-chair.png', index: '01' },
    { color: '#E5E5E5', image: '/chair-white.png', index: '02' },
    { color: '#F4EBE1', image: '/chair-beige.png', index: '03' },
    { color: '#7DA69D', image: '/chair-mint.png', index: '04' },
    { color: '#C3C1D0', image: '/chair-lavender.png', index: '05' },
  ];

  categories = [
    { icon: 'fa-solid fa-couch', name: 'Living Room' },
    { icon: 'fa-solid fa-bed', name: 'Bedroom' },
    { icon: 'fa-solid fa-table', name: 'Dining Sets' },
    { icon: 'fa-solid fa-chair', name: 'Office Furniture' },
  ];

  filters = ['ALL', 'LIVING ROOM', 'DRAWING', 'OFFICE', 'OUTDOOR'];

  products = [
    { id: 1, name: 'Olive Crest Lounge Chair', price: 420, image: '/product-1-olive.png', category: 'LIVING ROOM', class: 'showcase-large' },
    { id: 2, name: 'Ivory Haven Armchair', price: 360, image: '/product-2-ivory.png', category: 'LIVING ROOM', class: 'showcase-med-top' },
    { id: 3, name: 'Oak Nest Accent Chair', price: 310, image: '/product-3-oak.png', category: 'DRAWING', class: 'showcase-small-right' },
    { id: 4, name: 'Cloud Ease Chair', price: 260, image: '/product-4-cloud.png', category: 'BEDROOM', class: '' },
    { id: 5, name: 'Amber Loop Chair', price: 330, image: '/product-5-amber.png', category: 'OFFICE', class: '' },
    { id: 6, name: 'Sage Frame Armchair', price: 295, image: '/product-6-sage.png', category: 'OUTDOOR', class: '' },
  ];

  // تم تحديث الأسئلة والأجوبة لتطابق تصميم قسم الـ FAQ المطلوب
  accordions = [
    { 
      title: 'What Materials Are Used In Your Furniture?', 
      content: 'Stylish, Comfortable & Affordable Furniture — Designed To Make Your Home Feel Truly Yours.' 
    },
    { 
      title: 'Do You Offer Customization Options?', 
      content: 'We offer a wide range of customization options including fabrics, wood finishes, and tailored dimensions.' 
    },
    { 
      title: 'How Long Does Delivery Take?', 
      content: 'Standard delivery typically takes 5 to 7 business days straight to your doorstep.' 
    },
    { 
      title: 'Do You Provide Assembly Services?', 
      content: 'Yes, professional assembly services are available upon request during checkout.' 
    },
    { 
      title: 'What Is Your Return Policy?', 
      content: 'We offer a seamless, transparent, and risk-free 30-day return policy guarantee.' 
    }
  ];

  ngOnInit() {}

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

  changeSwatch(swatch: any) {
    if (this.currentSlide === swatch.index) return;
    this.chairOpacity = 0;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.currentChairImage = swatch.image;
      this.currentSlide = swatch.index;
      this.chairOpacity = 1;
      this.cdr.detectChanges();
    }, 500);
  }

  // Categories available in Collection page filter bar
  collectionAvailableCategories = ['ALL', 'LIVING ROOM', 'BEDROOM', 'OFFICE', 'OUTDOOR'];

  setCategory(index: number) {
    this.activeCategory = index;
    const catName = (this.categories[index]?.name || '').toUpperCase().trim();
    if (catName) {
      this.router.navigate(['/collection'], { queryParams: { category: catName } });
    }
  }

  onShowcaseProductClick(product: any) {
    const cat = (product?.category || '').toUpperCase().trim();
    if (cat && this.collectionAvailableCategories.includes(cat)) {
      this.router.navigate(['/collection'], { queryParams: { category: cat } });
    }
    // If category is not yet available on Collection page (e.g. DRAWING), do nothing until added there
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  toggleAccordion(index: number) {
    this.activeAccordion = this.activeAccordion === index ? -1 : index;
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}