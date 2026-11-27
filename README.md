# HOMEVO App (`homevo-app`)

Modern furniture e-commerce storefront and role-protected Admin Panel built with **Angular** and **TypeScript**, backed by a **REST API** and **Neon** PostgreSQL database, with continuous deployment on **Vercel**.

## Tech Stack & Architecture
- **Frontend:** Angular & TypeScript with responsive mobile-first styling across storefront and checkout flows.
- **Authentication & Security:** Route guards (`adminGuard`), HTTP token attachment (`auth.interceptor.ts`), and safe error handling.
- **State & Persistence:** Cart and Favorites managed with `localStorage` and synchronized with product data from the backend API.
- **Backend & Database:** RESTful API connected to **Neon** (cloud PostgreSQL); sensitive connection credentials stay in server/platform environment variables.
- **Hosting & CI/CD:** Pushing to `main` on GitHub automatically triggers production builds on **Vercel**.

## Key Features
- **Storefront:** Home hero & promotional sections, Categories, Collection filtering, Product details, About, Favorites, Cart quantity controls, Checkout progress steps, and Order Confirmation.
- **Admin Panel:** Protected routes for managing Dashboard overview, Products, Categories, and Customer Orders.

## Local Setup
```bash
npm install
npx tsc --noEmit
npx ng serve
npx ng build
```

## Deployment
Push commits to `main` on GitHub to trigger an automatic deployment on Vercel.
