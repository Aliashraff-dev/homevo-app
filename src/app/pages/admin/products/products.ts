import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminSidebarComponent],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class AdminProductsComponent implements OnInit {
  apiUrl = environment.apiBaseUrl;

  products: any[] = [];
  searchTerm = '';
  loading = true;
  deleteTargetId: number | null = null;
  errorMessage = '';
  sessionExpiredMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProducts();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private handleAuthError(err: unknown): boolean {
    if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
      this.sessionExpiredMessage = 'Your session has expired or you are not authorized. Please log in again.';
      this.loading = false;
      this.cdr.detectChanges();
      return true;
    }
    return false;
  }

  private extractList(response: any, keys: string[] = []): any[] {
      if (Array.isArray(response)) return response;
      for (const k of ["data", "items", ...keys]) {
        if (Array.isArray(response?.[k])) return response[k];
      }
      return [];
    }

  loadProducts() {
    this.loading = true;
    this.errorMessage = '';
    this.sessionExpiredMessage = '';
    const headers = this.getAuthHeaders();
    let url = `${this.apiUrl}/Products?pageSize=100`;

    if (this.searchTerm.trim()) {
      url += `&Search=${encodeURIComponent(this.searchTerm.trim())}`;
    }

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        this.products = this.extractList(data, ["products"]);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        console.error('Error loading products:', err);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.loadProducts();
  }

  confirmDelete(id: number) {
    this.deleteTargetId = id;
  }

  cancelDelete() {
    this.deleteTargetId = null;
  }

  deleteProduct() {
    if (this.deleteTargetId === null) return;

    this.errorMessage = '';
    const targetId = this.deleteTargetId;
    const headers = this.getAuthHeaders();

    this.http.delete(`${this.apiUrl}/Products/${targetId}`, { headers }).subscribe({
      next: () => {
        this.deleteTargetId = null;
        this.products = this.products.filter((p) => p.id !== targetId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deleteTargetId = null;
        if (this.handleAuthError(err)) return;
        console.error('Error deleting product:', err);
        this.errorMessage = 'Failed to delete product. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
