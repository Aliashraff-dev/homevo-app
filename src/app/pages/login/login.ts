import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  isLoginMode = true;
  apiUrl = environment.apiBaseUrl;
  errorMessage = '';

  authData = {
    name: '',
    email: '',
    password: ''
  };

  errors = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.clearErrors();
    this.authData = { name: '', email: '', password: '' };
  }

  clearErrors() {
    this.errorMessage = '';
    this.errors = { name: '', email: '', password: '' };
  }

  validateSignUp(): boolean {
    this.clearErrors();
    let isValid = true;

    if (!this.authData.name || this.authData.name.trim().length < 3) {
      this.errors.name = 'Name must be at least 3 characters long.';
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.authData.email || !emailPattern.test(this.authData.email)) {
      this.errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!this.authData.password) {
      this.errors.password = 'Password is required.';
      isValid = false;
    }

    return isValid;
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+' ).replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  private handleAuthSuccess(response: any) {
    if (response && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken || '');
      localStorage.setItem('userName', response.fullName || this.authData.name);

      const decoded = this.decodeToken(response.token);
      const role = decoded ? decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] : null;

      const isAdmin = Array.isArray(role) ? role.includes('Admin') : role === 'Admin';
      if (isAdmin) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  onSubmit() {
    this.clearErrors();

    if (this.isLoginMode) {
      if (!this.authData.email.trim() || !this.authData.password.trim()) {
        this.errorMessage = this.formatErrorText('Please enter both email and password.');
        this.cdr.detectChanges();
        return;
      }

      this.http.post<any>(`${this.apiUrl}/Auth/login`, {
        email: this.authData.email,
        password: this.authData.password
      }).subscribe({
        next: (response) => {
          this.handleAuthSuccess(response);
        },
        error: (err) => {
          console.error('Login error details:', err);
          this.errorMessage = this.formatErrorText(err.error || 'Invalid email or password.');
          this.cdr.detectChanges(); // تحديث فوري للشاشة عند الخطأ
        }
      });

    } else {
      if (this.validateSignUp()) {
        const registeredEmail = this.authData.email;

        this.http.post<any>(`${this.apiUrl}/Auth/register`, {
          fullName: this.authData.name,
          email: this.authData.email,
          password: this.authData.password
        }).subscribe({
          next: (response) => {
            this.isLoginMode = true;
            this.clearErrors();
            this.authData = {
              name: '',
              email: registeredEmail,
              password: ''
            };
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Register error details:', err);
            if (err.error) {
              if (typeof err.error === 'string') {
                this.errorMessage = this.formatErrorText(err.error);
              } else if (Array.isArray(err.error)) {
                this.errorMessage = this.formatErrorText(err.error.join(' | '));
              } else {
                this.errorMessage = this.formatErrorText(JSON.stringify(err.error));
              }
            } else {
              this.errorMessage = this.formatErrorText('Bad Request (400): Check password complexity or email format.');
            }
            this.cdr.detectChanges(); // تحديث فوري للشاشة عند الخطأ
          }
        });
      }
    }
  }

  private formatErrorText(err: any): string {
    const raw = err?.error?.message ?? err?.error ?? err?.message ?? "";
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed || trimmed === "{}" || trimmed === "[]") {
        return "Something went wrong. Please check your details and try again.";
      }
      return trimmed;
    }
    if (typeof raw === "object" && raw !== null) {
      if (typeof raw.title === "string" && raw.title.trim()) return raw.title.trim();
      const keys = Object.keys(raw);
      if (keys.length === 0) {
        return "Something went wrong. Please check your details and try again.";
      }
      const firstVal = raw[keys[0]];
      if (Array.isArray(firstVal) && firstVal.length) return String(firstVal[0]);
      if (typeof firstVal === "string" && firstVal.trim()) return firstVal.trim();
    }
    return "Something went wrong. Please check your details and try again.";
  }

}