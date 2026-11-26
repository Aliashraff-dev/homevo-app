import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.css']
})
export class AdminSidebarComponent {
  menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-gauge', route: '/admin/dashboard' },
    { label: 'Products', icon: 'fa-solid fa-couch', route: '/admin/products' },
    { label: 'Add Product', icon: 'fa-solid fa-plus', route: '/admin/add-product' },
    { label: 'Categories', icon: 'fa-solid fa-list', route: '/admin/categories' },
    { label: 'Orders', icon: 'fa-solid fa-bag-shopping', route: '/admin/orders' },
  ];

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/']);
  }
}
