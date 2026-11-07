# FoodExpress – Online Food Delivery System

A React + Vite demo application for a college project review.

## Features
- Home page with search, food categories and menu cards
- Signup and login using browser Local Storage
- User cart, checkout simulation and order history
- Admin dashboard to add, edit and delete food items
- Admin can view orders and update order status
- Responsive desktop and mobile layout

## Run locally
1. Install Node.js (LTS).
2. Extract this project and open the folder in VS Code.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL shown by Vite.

## Demo admin login
- Email: `admin@foodexpress.com`
- Password: `admin123`

## User login
Create a user account through the Sign up page. Accounts are stored in Local Storage in the current browser.

## Important project-review note
This is a front-end academic demo. Local Storage is not secure authentication and is not a production database. Do not use real passwords or payment details. For production, use a backend, hashed passwords, authorization and a payment provider.

## GitHub and Vercel
Push the project folder to a GitHub repository. In Vercel, import that repository. Vercel should detect Vite automatically:
- Build command: `npm run build`
- Output directory: `dist`
