import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartCount = signal(0);

  constructor() { this.updateCount(); }

  getCart(): any[] { return JSON.parse(localStorage.getItem('cart') || '[]'); }

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
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCount();
    
    // تشغيل التوست الفخم الجديد هنا بعد الإضافة بنجاح
    this.showSuccessToast();
  }

  updateCount() {
    const cart = this.getCart();
    this.cartCount.set(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
  }
}