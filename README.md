# Bookish Bliss 📚✨

Bookish Bliss is a modern, fully-featured e-commerce web application designed for an online bookstore. It provides a seamless and beautiful user experience for discovering, reading about, and purchasing books. 

This project is built using the **MERN** stack (MongoDB, Express, React, Node.js).

## 🌟 Features

* **User Authentication:** Secure registration and login using JWT and password hashing (bcrypt).
* **Book Catalog:** Browse books, view detailed descriptions, ratings, stock status, and author info.
* **Shopping Cart & Checkout:** Manage cart items and proceed to a smooth checkout process.
* **Wishlist:** Save your favorite books to your personal wishlist to buy them later.
* **Order Management:** View order history and order details from the user profile.
* **User Profile:** Update personal information, manage shipping addresses, and change passwords.
* **Request a Book:** Users can request specific books that aren't available in the store.
* **Contact Us:** Send messages and feedback to the store administrators.
* **Responsive & Beautiful UI:** Built with custom SCSS and Bootstrap for a stunning layout on all devices, featuring elegant gradients, shadows, and hover animations.

## 🛠️ Technology Stack

**Frontend (`/bookish_bliss_frontend`):**
* React.js (Vite)
* Redux Toolkit (State Management & RTK Query for API calls)
* React Router DOM (Navigation)
* SCSS & Bootstrap 5 (Styling)
* SweetAlert2 (Interactive alerts & toasts)

**Backend (`/bookish_bliss_backend`):**
* Node.js & Express.js
* MongoDB & Mongoose (Database & ORM)
* JSON Web Tokens (Authentication)
* bcryptjs (Password encryption)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/SnehDaluka/bookish_bliss.git
cd bookish_bliss
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd bookish_bliss_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend root and add your configuration:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd bookish_bliss_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend root:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Open the App
The frontend will usually be running at `http://localhost:5173`. Open this URL in your browser to start exploring Bookish Bliss!

## 📂 Project Structure

```
bookish_bliss/
├── bookish_bliss_backend/      # Express.js API Server
│   ├── src/
│   │   ├── controllers/        # Route logic
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API endpoints
│   │   └── middleware/         # Auth & Validation middlewares
│   └── index.js                # Server entry point
│
├── bookish_bliss_frontend/     # React.js Frontend App
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page level components (Home, Cart, Profile, etc.)
│   │   ├── store/              # Redux store and API slices
│   │   └── scss/               # Global styling and specific component styles
│   └── index.html              # Main HTML file
│
└── README.md                   # Root documentation
```

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
