# Bookish Bliss - Backend API

Welcome to the backend repository for **Bookish Bliss**, a premium e-commerce bookstore platform. This Node.js/Express server powers the Bookish Bliss frontend by providing a robust REST API, secure authentication, and database management.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Middleware:** CORS, Cookie-Parser, Express.json

## ✨ Key Features

- **Secure Authentication:** Implements industry-standard JWT authentication. Tokens are stored securely via HTTP-only cookies to prevent XSS attacks.
- **Robust Book Catalog API:** Fully featured endpoints to fetch, search, filter by category, and retrieve detailed metadata for the entire bookstore catalog.
- **Cart & Order Management:** Complex aggregation and validation to handle user carts, calculate order totals, and process final checkouts.
- **User Profile Management:** Endpoints for users to manage their personal information, update security credentials, and manage a dynamic array of shipping addresses.
- **Rating System:** Allows authenticated users to leave ratings and reviews on purchased books.

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js and MongoDB installed (or access to a MongoDB Atlas URI).

### Installation
1. Clone the repository and navigate to the backend directory:
   ```bash
   cd bookish_bliss_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and specify the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   *(Assuming `nodemon` is configured in your `package.json` scripts)*

## 🛣️ API Endpoints Overview

- **Auth (`/api/auth`)**: `/login`, `/register`, `/logout`, `/change-password`
- **Users (`/api/users`)**: `/profile`, `/addresses`
- **Books (`/api/books`)**: `/`, `/category/:category`, `/search/:name`, `/:id`
- **Cart (`/api/cart`)**: `/`, `/add`, `/remove`, `/clear`
- **Orders (`/api/orders`)**: `/`, `/place`, `/:id`

## 🔒 Security Posture
- All sensitive user data (passwords) is hashed using `bcrypt` before being stored in the database.
- Private routes are protected by an `auth` middleware that verifies the presence and validity of the JWT cookie.
