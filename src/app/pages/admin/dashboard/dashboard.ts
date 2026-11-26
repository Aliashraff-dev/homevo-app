import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminSidebarComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  apiUrl = environment.apiBaseUrl;

  summary = {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  };

  recentOrders: any[] = [];
  lowStockProducts: any[] = [];
  orderStatusStats: any[] = [];

  adminName = 'Admin';
  currentDate = new Date();
  loading = true;
  sessionExpiredMessage = "";

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setAdminName();
    this.loadDashboardData();
  }

  private setAdminName() {
    // حاول قراءة الاسم من الحفظ المحلي أو افترض الأدمن
    const savedName = localStorage.getItem('userName') || localStorage.getItem('userEmail');
    if (savedName) {
      this.adminName = savedName;
    }
  }

  private getAuthHeaders() {
    // فحص المفتاحين لضمان جلب التوكن بأي اسم تم حفظه به
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadDashboardData() {
    const headers = this.getAuthHeaders();

    this.http.get<any>(`${this.apiUrl}/Dashboard/summary`, { headers })
      .subscribe({
        next: (data) => {
          if (data) {
            this.summary = data;
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading summary:', err)
      });

    this.http.get<any[]>(`${this.apiUrl}/Dashboard/recent-orders`, { headers })
      .subscribe({
        next: (data) => {
          this.recentOrders = data || [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => { if (this.handleAuthError(err)) return; 
          console.error('Error loading orders:', err); 
          this.loading = false; 
          this.cdr.detectChanges();
        }
      });

    this.http.get<any[]>(`${this.apiUrl}/Dashboard/low-stock`, { headers })
      .subscribe({
        next: (data) => {
          this.lowStockProducts = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading low stock:', err)
      });

    this.http.get<any[]>(`${this.apiUrl}/Dashboard/order-status-chart`, { headers })
      .subscribe({
        next: (data) => {
          this.orderStatusStats = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading chart:', err)
      });
  }

  private handleAuthError(err: any): boolean {
    if (err?.status === 401 || err?.status === 403) {
      this.sessionExpiredMessage = "Your session has expired or you are not authorized. Please log in again.";
      this.loading = false;
      this.cdr.detectChanges();
      return true;
    }
    return false;
  }
}
