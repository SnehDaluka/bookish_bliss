# Bookish Bliss - Frontend

Welcome to the frontend repository for **Bookish Bliss**, a premium, modern e-commerce platform dedicated to book lovers. This application provides a beautifully designed, seamless Single Page Application (SPA) experience for browsing, managing carts, and purchasing books.

## 🚀 Tech Stack

- **Framework:** React.js (Vite)
- **State Management:** Redux Toolkit (RTK Query for declarative API fetching and caching)
- **Routing:** React Router v6
- **Styling:** Custom SCSS & Bootstrap 5
- **UI Components:** React Datepicker, SweetAlert2, FontAwesome Icons

## ✨ Key Features

- **Dynamic Homepage:** Live trending books feed fetched directly from the backend API with premium hero banners and trust signals.
- **Premium UI/UX:** Fully custom "Bookish Bliss Orange" theme with micro-animations, glassmorphism shadows, and deep dark-mode footer integration.
- **Advanced State Management:** RTK Query efficiently caches books, user profiles, and cart data to ensure lightning-fast navigation.
- **Comprehensive Profile Dashboard:** A multi-tab dashboard allowing users to manage personal details, security settings, and multiple shipping addresses.
- **Customer Feedback & Book Requests:** Users can use the Contact page to send messages or use the Request Book feature to ask for books not currently in the catalog.
- **Wishlist:** An elegant wishlist overlay allowing users to instantly save and track their favorite titles.
- **Intelligent Address Management:** Auto-formatting date pickers and smart validation to prevent users from deleting their primary default address without confirmation.

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed.

### Installation
1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd bookish_bliss_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and specify the backend API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Folder Structure

- `src/components/` - Reusable UI elements (Navbar, Footer, Book Cards).
- `src/pages/` - Core route views (Home, Login, Profile, Checkout, Contact, Request Book).
- `src/scss/` - Modular styling architecture with a global theme overrides system.
- `src/store/` - Redux Toolkit slices and RTK Query API endpoints (`apiSlice.js`).

## 🎨 Theming
The application uses a highly customized Bootstrap theme. The primary color (`#ff6200`) is globally injected into all interactive elements (buttons, focus rings, hover states, and active dropdowns) via `src/scss/index.scss`.
