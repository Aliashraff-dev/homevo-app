import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartCount = signal(0);

  constructor() { this.updateCount(); }

  getCart(): any[] {
    try {
      const parsed = JSON.parse(localStorage.getItem('cart') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveCart(cart: any[]) {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCount();
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
    const updated = this.getCart().map((item: any) => {
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
        image: match.image || nextImage,
        quantity: Math.max(1, Number(item.quantity) || 1)
      };
    });

    if (changed) {
      this.saveCart(updated);
    }
  }

  // دالة إظهار إشعار النجاح المخصص في كورنر الموقع اليمين فوق بدلاً من الـ alert
  showSuccessToast() {
    // 1. إنشاء عنصر الـ Toast ديناميكياً في الـ DOM
    const toast = document.createElement('div');
    toast.className = 'custom-cart-toast';

    // 2. تصميم المحتوى الداخلي (علامة الصح والجملة المطلوبة بالظبط)
    toast.innerHTML = `
      <span class="toast-icon">✓</span>
      <div class="toast-content">
        <strong class="toast-title">Success!</strong>
        <span class="toast-msg">This item is added to cart</span>
      </div>
    `;

    // 3. إضافة الـ Toast لجسم الصفحة (Body) ليظهر فوق كل العناصر
    document.body.appendChild(toast);

    // 4. تشغيل الأنيميشن الخاص بالدخول بعد لحظة صغيرة جداً
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // 5. إخفاء الـ Toast وحذفه تماماً تلقائياً بعد ثانيتين
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300); // حذفه نهائياً بعد انتهاء أنيميشن الخروج
    }, 2000);
  }

  addToCart(product: any) {
    let cart = this.getCart();
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity = (Number(existing.quantity) || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    this.saveCart(cart);

    // تشغيل التوست الفخم الجديد هنا بعد الإضافة بنجاح
    this.showSuccessToast();
  }

  updateCount() {
    const cart = this.getCart();
    this.cartCount.set(cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0));
  }
}
