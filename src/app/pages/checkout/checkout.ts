import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  cart: any[] = [];
  subtotal = 0;
  shipping = 25;
  tax = 40;
  total = 0;

  shippingInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };

  paymentMethod = 'cod';
  discountCode = '';
  discountMessage = '';
  errorMessage = '';
  isSubmitted = false;
  isSubmitting = false;

  private apiUrl = `${environment.apiBaseUrl}/Orders`;
  private productsUrl = `${environment.apiBaseUrl}/Products`;

  constructor(
    private cartService: CartService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cart = this.cartService.getCart();
    this.subtotal = this.cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    this.total = this.subtotal > 0 ? this.subtotal + this.shipping + this.tax : 0;
  }

  applyDiscount() {
    this.errorMessage = '';
    if (this.discountCode.trim()) {
      this.discountMessage = `Code "${this.discountCode.trim()}" applied successfully!`;
    } else {
      this.discountMessage = '';
      this.errorMessage = 'Please enter a valid discount code.';
    }
    this.cdr.detectChanges();
  }

  onPlaceOrder() {
    this.isSubmitted = true;
    this.errorMessage = '';

    const isFormValid =
      this.shippingInfo.firstName.trim() &&
      this.shippingInfo.lastName.trim() &&
      this.shippingInfo.email.trim() &&
      this.shippingInfo.phone.trim() &&
      this.shippingInfo.address.trim() &&
      this.shippingInfo.city.trim() &&
      this.shippingInfo.state.trim() &&
      this.shippingInfo.country.trim();

    if (!isFormValid) {
      this.cdr.detectChanges();
      return;
    }

    if (this.cart.length === 0) {
      this.errorMessage = 'Your cart is empty.';
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'You must be logged in to place an order.';
      this.cdr.detectChanges();
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.http.get<any[]>(`${this.productsUrl}?pageSize=200`).subscribe({
      next: (dbProducts) => {
        const validIds = new Set(
          (dbProducts || [])
            .map((p: any) => Number(p.id ?? p.Id))
            .filter((id: number) => Number.isInteger(id) && id > 0)
        );

        const invalidItem = this.cart.find((item) => {
          const itemId = Number(item.id);
          const qty = Number(item.quantity);
          return !validIds.has(itemId) || !Number.isInteger(qty) || qty <= 0;
        });

        if (invalidItem) {
          this.isSubmitting = false;
          this.errorMessage = `Some items in your cart are unavailable or invalid (${invalidItem.name || 'Item'}). Please review your cart.`;
          this.cdr.detectChanges();
          return;
        }

        const orderPayload = {
          items: this.cart.map((item) => ({
            productId: Number(item.id),
            quantity: Number(item.quantity)
          }))
        };

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        this.http.post<any>(this.apiUrl, orderPayload, { headers }).subscribe({
          next: (response: any) => {
            const orderData = {
              shippingInfo: this.shippingInfo,
              products: this.cart,
              subtotal: this.subtotal,
              shipping: this.shipping,
              tax: this.tax,
              total: this.total,
              orderId: response?.orderNumber || ('HV-2026-' + (response?.id ?? ''))
            };

            localStorage.setItem('lastOrder', JSON.stringify(orderData));
            localStorage.removeItem('cart');
            this.cartService.updateCount();

            this.isSubmitting = false;
            this.isSubmitted = false;
            this.cdr.detectChanges();

            this.router.navigate(['/confirmation']);
          },
          error: (err) => {
            console.error('Server rejected order:', err);
            this.isSubmitting = false;

            if (err?.status === 401 || err?.status === 403) {
              this.errorMessage = 'Your session has expired or you are not authorized. Please log in again.';
              this.cdr.detectChanges();
              this.router.navigate(['/login']);
              return;
            }

            const errorMsg =
              err?.error?.message ||
              err?.error?.title ||
              (typeof err?.error === 'string' ? err.error : 'Unable to place order. Please try again.');
            this.errorMessage = `Order failed (${err?.status || 'Error'}): ${errorMsg}`;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.isSubmitting = false;
        this.errorMessage = 'Could not connect to backend to verify products.';
        this.cdr.detectChanges();
      }
    });
  }
}
