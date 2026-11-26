# Homevo App

Modern **Angular** and **TypeScript** storefront and admin web application for the **Homevo** e-commerce platform.

## Key Features
- Responsive storefront experience across desktop, tablet, and mobile viewports
- Product catalog, collection browsing, product details, cart, favorites, and checkout flow
- Route-guarded admin panel (`admin.guard.ts`) for managing dashboard metrics, products, categories, and customer orders
- Environment-driven API configuration (`environment.ts` and `environment.prod.ts`) with HTTP interceptors

## Tech Stack
- **Framework:** Angular & TypeScript
- **Styling:** Responsive CSS & component-based architecture

## Configuration & Running Locally
Update `src/environments/environment.ts` (and `src/environments/environment.prod.ts` for production) with your backend `apiBaseUrl`, then install dependencies and start the dev server:

    npm install
    npm start
