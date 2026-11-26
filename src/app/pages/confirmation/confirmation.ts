import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './confirmation.html',
  styleUrls: ['./confirmation.css']
})
export class ConfirmationComponent implements OnInit {
  order: any = null;

  ngOnInit() {
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      try {
        this.order = JSON.parse(savedOrder);
      } catch (err) {
        console.error('Invalid lastOrder in localStorage:', err);
        this.order = null;
      }
    }
  }
}
