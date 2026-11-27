import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent) },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent) },
  { path: 'collection', loadComponent: () => import('./pages/collection/collection').then(m => m.CollectionComponent) },
  { path: 'product', loadComponent: () => import('./pages/product/product').then(m => m.ProductComponent) },
  { path: 'testimonial', loadComponent: () => import('./pages/testimonial/testimonial').then(m => m.TestimonialComponent) },
  { path: 'favorites', loadComponent: () => import('./pages/favorites/favorites').then(m => m.FavoritesComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutComponent) },
  { path: 'confirmation', loadComponent: () => import('./pages/confirmation/confirmation').then(m => m.ConfirmationComponent) },
  
  // Admin Routes
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'admin/dashboard', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent) },
  { path: 'admin/products', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/products/products').then(m => m.AdminProductsComponent) },
  { path: 'admin/edit-product/:id', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/edit-product/edit-product').then(m => m.AdminEditProductComponent) },
  { path: 'admin/add-product', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/add-product/add-product').then(m => m.AdminAddProductComponent) },
  { path: 'admin/categories', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/categories/categories').then(m => m.AdminCategoriesComponent) },
  { path: 'admin/orders', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/orders/orders').then(m => m.AdminOrdersComponent) },

  // Wildcard Route
  { path: '**', redirectTo: '' }
];