import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './testimonial.html',
  styleUrls: ['./testimonial.css']
})
export class TestimonialComponent {
  testimonials = [
    { stars: '★★★★★', quote: 'Craftsmanship beyond expectations.', name: 'Ahmed M.' },
    { stars: '★★★★★', quote: 'Minimalist and elegant.', name: 'Sarah L.' },
    { stars: '★★★★☆', quote: 'Stunning quality, highly recommended.', name: 'Omar K.' },
    { stars: '★★★★★', quote: 'Simply perfect design.', name: 'Nada F.' },
    { stars: '★★★★★', quote: 'The wood finish is incredible.', name: 'Karim T.' },
    { stars: '★★★★★', quote: 'Great experience from A to Z.', name: 'Leila H.' },
    { stars: '★★★★☆', quote: 'Very comfortable chairs.', name: 'Youssef R.' },
    { stars: '★★★★★', quote: 'Exactly as shown in photos.', name: 'Mariam A.' },
    { stars: '★★★★★', quote: 'My home feels complete now.', name: 'Hany S.' },
  ];
}