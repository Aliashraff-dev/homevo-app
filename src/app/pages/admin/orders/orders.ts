import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class AdminOrdersComponent implements OnInit {
  apiUrl = `${environment.apiBaseUrl}/Orders/admin`;
  statusEndpointBase = `${environment.apiBaseUrl}/Orders`;
  orders: any[] = [];
  loading = true;
  sessionExpiredMessage = '';
  statusUpdatedMessage = '';
  statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  private readonly localStatusKey = 'homevo_admin_order_statuses';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    localStorage.removeItem('admin_orders');
    localStorage.removeItem('orders');
    this.loadOrders();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getSavedStatuses(): Record<string, string> {
    try {
      const raw = localStorage.getItem(this.localStatusKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveStatusLocally(orderKey: string, status: string) {
    const current = this.getSavedStatuses();
    current[orderKey] = status;
    localStorage.setItem(this.localStatusKey, JSON.stringify(current));
  }

  loadOrders() {
    this.loading = true;
    const headers = this.getAuthHeaders();
    const savedStatuses = this.getSavedStatuses();

    this.http.get<any>(this.apiUrl, { headers }).subscribe({
      next: (response) => {
        const rawData = Array.isArray(response)
          ? response
          : (response?.data || response?.items || response?.orders || []);

        this.orders = rawData.map((order: any) => {
          const rawPrice = order.totalPrice ?? order.totalAmount ?? order.total ?? 0;
          const itemsArr = order.items || order.orderItems || order.products || [];
          const itemsLen = order.itemsCount ?? itemsArr.length;

          const numId = order.id || order.orderId;
          const formattedNumber = order.orderNumber || (numId ? `HV-2026-${numId}` : 'HV-2026-N/A');
          const orderKey = String(numId ?? formattedNumber);

          const resolvedName = order.customerName || order.user?.userName || order.user?.fullName || 'Unknown Customer';
          const resolvedEmail = order.customerEmail || order.user?.email || '';
          const resolvedStatus = order.status || savedStatuses[orderKey] || 'Pending';

          return {
            ...order,
            _orderId: numId,
            _orderKey: orderKey,
            orderNumber: formattedNumber,
            customerName: resolvedName,
            customerEmail: resolvedEmail,
            totalAmount: typeof rawPrice === 'number' ? rawPrice.toFixed(2) : rawPrice,
            itemsCount: itemsLen,
            createdAt: order.createdAt || order.orderDate || order.date || new Date().toISOString(),
            status: resolvedStatus
          };
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (this.handleAuthError(err)) return;
        console.error('Error fetching orders:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onStatusChange(order: any, newStatus: string) {
    const previousStatus = order.status;
    order.status = newStatus;
    this.saveStatusLocally(order._orderKey, newStatus);
    this.statusUpdatedMessage = `Order ${order.orderNumber} status set to ${newStatus}.`;

    if (order._orderId) {
      const endpoint = `${this.statusEndpointBase}/${order._orderId}/status`;
      this.http.patch<any>(endpoint, { status: newStatus }, { headers: this.getAuthHeaders() }).subscribe({
        next: () => {
          this.saveStatusLocally(order._orderKey, newStatus);
          this.statusUpdatedMessage = `Order ${order.orderNumber} synced with API (${newStatus}).`;
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (this.handleAuthError(err)) {
            order.status = previousStatus;
            this.saveStatusLocally(order._orderKey, previousStatus);
            this.cdr.detectChanges();
            return;
          }
          if (err?.status === 404 || err?.status === 405) {
            this.statusUpdatedMessage = `Order ${order.orderNumber} set to ${newStatus} (saved locally; endpoint pending).`;
          } else {
            order.status = previousStatus;
            this.saveStatusLocally(order._orderKey, previousStatus);
            this.statusUpdatedMessage = `Failed to update order ${order.orderNumber} status. Reverted to ${previousStatus}.`;
          }
          this.cdr.detectChanges();
        }
      });
    }
    this.cdr.detectChanges();

    setTimeout(() => {
      this.statusUpdatedMessage = '';
      this.cdr.detectChanges();
    }, 2500);
  }

  private handleAuthError(err: any): boolean {
    if (err?.status === 401 || err?.status === 403) {
      this.sessionExpiredMessage = 'Your session has expired or you are not authorized. Please log in again.';
      this.loading = false;
      this.cdr.detectChanges();
      return true;
    }
    return false;
  }
}