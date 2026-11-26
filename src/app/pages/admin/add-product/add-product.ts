import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css']
})
export class AdminAddProductComponent implements OnInit {
  apiUrl = environment.apiBaseUrl;

  categories: any[] = [];

  product = {
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    stockQuantity: 0,
    isFeatured: false,
    categoryId: 0
  };

  errors: any = {};
  submitting = false;
  successMessage = '';
  sessionExpiredMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
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
      this.submitting = false;
      this.cdr.detectChanges();
      return true;
    }
    return false;
  }

  loadCategories() {
    this.http.get<any[]>(`${this.apiUrl}/Categories`).subscribe({
      next: (data) => {
        this.categories = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  validate(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.product.name.trim()) {
      this.errors.name = 'Product name is required.';
      isValid = false;
    }
    if (!this.product.description.trim()) {
      this.errors.description = 'Description is required.';
      isValid = false;
    }
    if (Number(this.product.price) <= 0) {
      this.errors.price = 'Price must be greater than zero.';
      isValid = false;
    }
    if (Number(this.product.stockQuantity) < 0) {
      this.errors.stockQuantity = 'Stock cannot be negative.';
      isValid = false;
    }
    if (!Number(this.product.categoryId) || Number(this.product.categoryId) === 0) {
      this.errors.categoryId = 'Please select a category.';
      isValid = false;
    }
    if (!this.product.imageUrl.trim()) {
      this.errors.imageUrl = 'Image URL is required.';
      isValid = false;
    }

    return isValid;
  }

  onSubmit() {
    this.successMessage = '';
    this.sessionExpiredMessage = '';

    if (!this.validate()) {
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    const headers = this.getAuthHeaders();

    const payload = {
      name: this.product.name.trim(),
      description: this.product.description.trim(),
      price: Number(this.product.price),
      imageUrl: this.product.imageUrl.trim(),
      stockQuantity: Number(this.product.stockQuantity),
      isFeatured: Boolean(this.product.isFeatured),
      categoryId: Number(this.product.categoryId)
    };

    this.http.post(`${this.apiUrl}/Products`, payload, { headers }).subscribe({
      next: () => {
        this.successMessage = 'Product added successfully!';
        this.submitting = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/admin/products']);
        }, 1200);
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        console.error('Error adding product:', err);
        console.error('Backend validation details:', err.error);
        this.submitting = false;
        this.errors.general = err?.error?.title || err?.error?.message || 'Failed to add product. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
