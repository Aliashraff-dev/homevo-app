import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class AdminCategoriesComponent implements OnInit {
  apiUrl = `${environment.apiBaseUrl}/Categories`;
  categories: any[] = [];
  newCategoryName = '';
  loading = true;
  errorMessage = '';
  sessionExpiredMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCategories();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private extractList(response: any, keys: string[] = []): any[] {
      if (Array.isArray(response)) return response;
      for (const k of ["data", "items", ...keys]) {
        if (Array.isArray(response?.[k])) return response[k];
      }
      return [];
    }

  loadCategories() {
    this.loading = true;
    this.errorMessage = '';
    this.sessionExpiredMessage = '';
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.categories = this.extractList(data, ["categories"]);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        console.error('Error fetching categories:', err);
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addCategory() {
    const trimmedName = this.newCategoryName.trim();
    if (!trimmedName) return;

    this.errorMessage = '';
    const headers = this.getAuthHeaders();
    const payload = { name: trimmedName };

    this.http.post(this.apiUrl, payload, { headers }).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.loadCategories();
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        console.error('Error adding category:', err);
        this.errorMessage = 'Failed to add category. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.errorMessage = '';
    const headers = this.getAuthHeaders();
    this.http.delete(`${this.apiUrl}/${id}`, { headers }).subscribe({
      next: () => this.loadCategories(),
      error: (err) => {
        if (this.handleAuthError(err)) return;
        console.error('Error deleting category:', err);
        this.errorMessage = 'Failed to delete category. Please try again.';
        this.cdr.detectChanges();
      }
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
}
