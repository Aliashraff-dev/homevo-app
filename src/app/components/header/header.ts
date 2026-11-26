import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service'; // 1. ضفنا استيراد خدمة السلة

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  showSearch = false;
  searchQuery = '';
  
  // متغيرة جديدة للتحكم في إظهار/إخفاء نافذة التأكيد الخاصة بتسجيل الخروج
  showLogoutConfirm = false; 

  // 2. حقنا الـ CartService هنا وخليناها public عشان الـ HTML يقرأ منها علطول
  constructor(
    private router: Router, 
    public favoritesService: FavoritesService,
    public cartService: CartService 
  ) {}

  ngOnInit() {
    // تم الاستغناء عن updateCartCount القديمة لأن الـ Signal شغال تلقائياً
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
    }
  }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/collection'], { queryParams: { search: this.searchQuery } });
      this.showSearch = false;
      this.searchQuery = '';
    }
  }

  // === دوال هيدر اللوجن والساين أب ===

  // دالة بتشيك هل المستخدم مسجل دخول ولا لأ
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // دالة بتجيب الاسم الأول من الـ localStorage عشان يظهر بشكل شيك في الهيدر
  getUserName(): string {
    const fullName = localStorage.getItem('userName');
    return fullName ? fullName.split(' ')[0] : ''; 
  }

  // === دوال التحكم في نافذة تسجل الخروج الجديدة ===

  // دالة تبديل إظهار/إخفاء نافذة التأكيد
  toggleLogoutConfirm() {
    this.showLogoutConfirm = !this.showLogoutConfirm;
  }

  // عند ضغط No
  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  // عند ضغط Yes (تأكيد الخروج)
  confirmLogout() {
    this.showLogoutConfirm = false;
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    
    // إعادة تحميل سريعة عشان السستم كله يتأثر وترجع الأيقونة مكان الاسم
    window.location.reload();
  }

  // دالة تسجيل الخروج الرئيسية (تفتح نافذة التأكيد بدلاً من رسالة المتصفح)
  logout() {
    this.toggleLogoutConfirm();
  }
}