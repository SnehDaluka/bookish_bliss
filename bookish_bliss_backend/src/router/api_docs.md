# Bookish Bliss API Documentation

Welcome to the detailed API Documentation for Bookish Bliss. The base URL for all endpoints is `/api`.

> [!IMPORTANT]
> **Authentication:** Endpoints marked with (Auth Required) require a valid JWT token stored in an `HttpOnly` cookie.

---

## Table of Contents

- [Authentication and User Profile](#authentication-and-user-profile)
  - [1. Register User](#1-register-user)
  - [2. Login User](#2-login-user)
  - [3. Logout User (Auth Required)](#3-logout-user-auth-required)
  - [4. Get Profile (Auth Required)](#4-get-profile-auth-required)
  - [5. Update Profile (Auth Required)](#5-update-profile-auth-required)
- [Books and Recommendations](#books-and-recommendations)
  - [6. Get All Books](#6-get-all-books)
  - [7. Search Books](#7-search-books)
  - [8. Get Book Details](#8-get-book-details)
  - [9. Get Recommendations (Auth Required)](#9-get-recommendations-auth-required)
- [Shopping Cart](#shopping-cart)
  - [10. Add to Cart (Auth Required)](#10-add-to-cart-auth-required)
  - [11. Get Cart Items (Auth Required)](#11-get-cart-items-auth-required)
  - [12. Update Cart (Auth Required)](#12-update-cart-auth-required)
- [Orders](#orders)
  - [13. Place Order (Auth Required)](#13-place-order-auth-required)
  - [14. Get User Orders (Auth Required)](#14-get-user-orders-auth-required)
- [Wishlist and Ratings](#wishlist-and-ratings)
  - [15. Add to Wishlist (Auth Required)](#15-add-to-wishlist-auth-required)
  - [16. Rate a Book (Auth Required)](#16-rate-a-book-auth-required)
- [General](#general)
  - [17. Submit Contact Form](#17-submit-contact-form)

---

## Authentication and User Profile

### 1. Register User
**`POST /register`**
Registers a new customer.
* **Payload:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "cpassword": "securepassword123"
}
```
* **Response (201 Created):**
```json
{
  "message": "User registered successfully"
}
```

### 2. Login User
**`POST /login`**
Authenticates a user and sets the `jwtoken` cookie.
* **Payload:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```
* **Response (200 OK):**
```json
{
  "message": "User Signin Successfully"
}
```

### 3. Logout User (Auth Required)
**`POST /logout`**
Clears the JWT cookie and removes the token from the database.
* **Payload:** `{}`
* **Response (200 OK):**
```json
{
  "message": "User Logged Out Successfully"
}
```

### 4. Get Profile (Auth Required)
**`GET /profile`**
Fetches the currently authenticated user's details.
* **Payload:** None
* **Response (200 OK):**
```json
{
  "_id": "60d5ecb8b3...2",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone": 1234567890,
  "gender": "Male",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Metropolis",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

### 5. Update Profile (Auth Required)
**`PATCH /profile`**
Updates user details.
* **Payload:**
```json
{
  "firstname": "Johnny",
  "phone": 9876543210,
  "shippingAddress": {
    "city": "Gotham"
  }
}
```
* **Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": { ...updated profile object... }
}
```

---

## Books and Recommendations

### 6. Get All Books
**`GET /books?page=1`**
Fetches a paginated list of books.
* **Payload:** None (Query param `page` optional)
* **Response (200 OK):**
```json
{
  "books": [
    {
      "_id": "60d...",
      "name": "harry potter",
      "author": "j.k. rowling",
      "sprice": 499,
      "rating": 4.8,
      "imgsrc": "http://link-to-image.jpg"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalBooks": 80
}
```

### 7. Search Books
**`GET /books/search?name=harry&page=1`**
Searches books via text index.
* **Payload:** None
* **Response (200 OK):** Same structure as Get All Books.

### 8. Get Book Details
**`GET /book/:id`**
Fetches details of a specific book.
* **Payload:** None
* **Response (200 OK):**
```json
{
  "_id": "60d...",
  "name": "harry potter",
  "description": "A magical journey...",
  "author": "j.k. rowling",
  "sprice": 499,
  "qty": 15,
  "category": ["Fantasy"]
}
```

### 9. Get Recommendations (Auth Required)
**`GET /books/recommendations`**
Returns ML collaborative filtering recommendations based on Jaccard Similarity and implicit feedback.
* **Payload:** None
* **Response (200 OK):**
```json
[
  {
    "_id": "60d...",
    "name": "the hobbit",
    "author": "j.r.r. tolkien",
    "sprice": 399,
    "rating": 4.9,
    "imgsrc": "http://link.to/image.jpg"
  }
]
```

---

## Shopping Cart

### 10. Add to Cart (Auth Required)
**`POST /addtocart`**
Adds a book to the user's cart (or increments quantity).
* **Payload:**
```json
{
  "_id": "60d5ec... (Book ID)"
}
```
* **Response (201 Created):**
```json
{
  "message": "item added"
}
```

### 11. Get Cart Items (Auth Required)
**`GET /cartitems`**
Fetches the user's populated cart.
* **Payload:** None
* **Response (200 OK):**
```json
[
  {
    "_id": "60d5ec...",
    "bookname": "harry potter",
    "quantity": 2,
    "price": 499,
    "originalPrice": 699
  }
]
```

### 12. Update Cart (Auth Required)
**`PATCH /cart?name=harry%20potter`**
Updates the quantity of a specific book in the cart.
* **Payload:**
```json
{
  "quantity": 3
}
```
* **Response (200 OK):**
```json
{
  "message": "Cart updated"
}
```

---

## Orders

### 13. Place Order (Auth Required)
**`POST /orders`**
Converts the current shopping cart into a placed order.
* **Payload:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Metropolis",
    "state": "NY",
    "zipCode": "10001"
  },
  "paymentMethod": "Credit Card"
}
```
* **Response (201 Created):**
```json
{
  "message": "Order placed successfully",
  "orderId": "60d5..."
}
```

### 14. Get User Orders (Auth Required)
**`GET /orders`**
Fetches the user's order history.
* **Payload:** None
* **Response (200 OK):**
```json
[
  {
    "_id": "60d5...",
    "orderDate": "2023-10-01T10:00:00Z",
    "totalAmount": 998,
    "status": "Processing",
    "items": [
      {
        "bookname": "harry potter",
        "quantity": 2,
        "price": 499
      }
    ]
  }
]
```

---

## Wishlist and Ratings

### 15. Add to Wishlist (Auth Required)
**`POST /wishlist/add`**
Adds a book to the wishlist.
* **Payload:**
```json
{
  "bookId": "60d5..."
}
```
* **Response (200 OK):**
```json
{
  "message": "Added to wishlist"
}
```

### 16. Rate a Book (Auth Required)
**`POST /books/:id/rate`**
Submits or updates a 1-5 star rating.
* **Payload:**
```json
{
  "rating": 5
}
```
* **Response (200 OK):**
```json
{
  "message": "Rating submitted successfully",
  "newAverageRating": 4.8
}
```

---

## General

### 17. Submit Contact Form
**`POST /messages`**
Saves a contact form message.
* **Payload:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Missing Book",
  "message": "I would like to request a specific book..."
}
```
* **Response (201 Created):**
```json
{
  "message": "Message sent successfully"
}
```
