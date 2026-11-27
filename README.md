# HOMEVO App (`homevo-app`)

Angular and TypeScript e-commerce storefront and role-protected Admin Panel connected to a REST API and Neon database.

## Key Features
- **Storefront:** Home, Collection, and Product detail views; Cart and Favorites backed by `localStorage` with automatic product sync from the API; Checkout flow with auth and product validation followed by Confirmation.
- **Admin Panel:** Route protection via `adminGuard`, automatic token attachment via `auth.interceptor.ts`, and management for Dashboard, Products, Categories, and Orders.

## Local Setup
```bash
npm install
npx tsc --noEmit
npx ng serve
npx ng build
```

## Deployment
Pushing to `main` on GitHub triggers automatic deployment on Vercel with environment configuration pointing to the backend API and Neon database.
