import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { AdminSidebarComponent } from "../../../components/admin-sidebar/admin-sidebar";
import { environment } from '../../../../environments/environment';

@Component({
  selector: "app-admin-edit-product",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminSidebarComponent],
  templateUrl: "./edit-product.html",
  styleUrls: ["./edit-product.css"]
})
export class AdminEditProductComponent implements OnInit {
  apiUrl = environment.apiBaseUrl;
  productId!: number;
  categories: any[] = [];

  product = {
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    stockQuantity: 0,
    isFeatured: false,
    categoryId: 0
  };

  errors: any = {};
  loading = true;
  sessionExpiredMessage = "";
  submitting = false;
  successMessage = "";

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get("id"));
    this.loadCategories();
    if (this.productId) {
      this.loadProduct();
    } else {
      this.loading = false;
      this.errors.general = "Invalid product ID.";
      this.cdr.detectChanges();
    }
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadCategories() {
    this.http.get<any[]>(`${this.apiUrl}/Categories`).subscribe({
      next: (data) => {
        this.categories = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error loading categories:", err)
    });
  }

  loadProduct() {
    this.loading = true;
    this.sessionExpiredMessage = "";
    const headers = this.getAuthHeaders();
    this.http.get<any>(`${this.apiUrl}/Products/${this.productId}`, { headers }).subscribe({
      next: (item) => {
        this.product = {
          name: item.name || "",
          description: item.description || "",
          price: Number(item.price) || 0,
          imageUrl: item.imageUrl || item.image || "",
          stockQuantity: Number(item.stockQuantity) || 0,
          isFeatured: Boolean(item.isFeatured),
          categoryId: Number(item.categoryId || item.category?.id || 0)
        };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        console.error("Error loading product:", err);
        this.loading = false;
        this.errors.general = "Failed to load product details.";
        this.cdr.detectChanges();
      }
    });
  }

  validate(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.product.name.trim()) {
      this.errors.name = "Product name is required.";
      isValid = false;
    }
    if (!this.product.description.trim()) {
      this.errors.description = "Description is required.";
      isValid = false;
    }
    if (Number(this.product.price) <= 0) {
      this.errors.price = "Price must be greater than zero.";
      isValid = false;
    }
    if (Number(this.product.stockQuantity) < 0) {
      this.errors.stockQuantity = "Stock cannot be negative.";
      isValid = false;
    }
    if (!Number(this.product.categoryId) || Number(this.product.categoryId) === 0) {
      this.errors.categoryId = "Please select a category.";
      isValid = false;
    }
    if (!this.product.imageUrl.trim()) {
      this.errors.imageUrl = "Image URL is required.";
      isValid = false;
    }

    return isValid;
  }

  onSubmit() {
    this.successMessage = "";
    this.sessionExpiredMessage = "";
    if (!this.validate()) {
      this.cdr.detectChanges();
      return;
    }

    this.submitting = true;
    const headers = this.getAuthHeaders();
    const payload = {
      id: this.productId,
      name: this.product.name.trim(),
      description: this.product.description.trim(),
      price: Number(this.product.price),
      imageUrl: this.product.imageUrl.trim(),
      stockQuantity: Number(this.product.stockQuantity),
      isFeatured: Boolean(this.product.isFeatured),
      categoryId: Number(this.product.categoryId)
    };

    this.http.put(`${this.apiUrl}/Products/${this.productId}`, payload, { headers }).subscribe({
      next: () => {
        this.successMessage = "Product updated successfully!";
        this.submitting = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(["/admin/products"]);
        }, 900);
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        console.error("Error updating product:", err);
        this.submitting = false;
        this.errors.general = err?.error?.title || err?.error?.message || "Failed to update product.";
        this.cdr.detectChanges();
      }
    });
  }

  private handleAuthError(err: unknown): boolean {
    if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
      this.sessionExpiredMessage = "Your session has expired or you are not authorized. Please log in again.";
      this.loading = false;
      this.submitting = false;
      this.cdr.detectChanges();
      return true;
    }
    return false;
  }
}
