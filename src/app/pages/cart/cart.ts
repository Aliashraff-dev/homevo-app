import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // تم إزالة RouterLink لمنع التحذير
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent], // تم إزالة RouterLink من هنا أيضاً
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cart: any[] = [];
  total = 0;
  isCartEmptyError = false; // متغير للتحكم في لون رسالة الخطأ لو السلة فارغة

  // 2. حقنا الـ Router هنا مع الحفاظ على الـ cartService
  constructor(public cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.renderCart();
  }

  // دالة لجلب البيانات وتحديث إجمالي السعر بالشاشة
  renderCart() {
    this.cart = this.cartService.getCart();
    this.total = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // دالة زيادة الكمية (+)
  increaseQuantity(index: number) {
    this.cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartService.updateCount(); // تحديث فوري لعداد الهيدر
    this.renderCart(); // تحديث فوري للأرقام والإجمالي في الصفحة
  }

  // دالة تقليل الكمية (-)
  decreaseQuantity(index: number) {
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity -= 1;
    } else {
      // لو الكمية وصلت 1 وداس ناقص، المنتج بيتمسح تماماً
      this.cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartService.updateCount(); // تحديث فوري لعداد الهيدر
    this.renderCart(); // تحديث فوري للأرقام والإجمالي في الصفحة
  }

  // دالة الحذف النهائي عند الضغط على Remove
  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartService.updateCount(); // تحديث فوري لعداد الهيدر
    this.renderCart(); // تحديث فوري للأرقام والإجمالي في الصفحة
  }

  // دالة إتمام الطلب المعدلة ذكياً بطلبك
  processOrder() {
    // تشيك أولاً: لو السلة فاضية تماماً يفعّل حالة الخطأ لتتلوّن باللون الأحمر
    if (this.cart.length === 0) {
      this.isCartEmptyError = true;
      return;
    }
    
    // لو السلة ليست فارغة، يتم إلغاء خطأ السلة الفارغة
    this.isCartEmptyError = false;

    // تشيك ثانياً: التأكد من تسجيل الدخول (لو مفيش توكن يحوله لصفحة الـ login/register)
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    
    // 3. لو السلة فيها منتجات ومسجل دخول، بيحوله لصفحة إتمام الطلب
    this.router.navigate(['/checkout']);
  }
}