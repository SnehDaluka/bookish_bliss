export const API_URLS = {
  // Auth & User
  PROFILE: '/profile',
  UPDATE_PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/password',
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  MESSAGES: '/messages',

  // Books
  BOOKS: (page = 1) => `/books?page=${page}`,
  BOOKS_CATEGORY: (category, page = 1) => `/books/category/${encodeURIComponent(category)}?page=${page}`,
  BOOKS_SEARCH: (name, page = 1) => `/books/search?name=${encodeURIComponent(name)}&page=${page}`,
  BOOK_DETAILS: (id) => `/book/${id}`,
  BOOK_BY_NAME: (name) => `/bookname?name=${encodeURIComponent(name)}`,
  REQUEST_BOOK: '/books/request',

  // Cart
  CART_ITEMS: '/cartitems',
  CART: (name) => `/cart?name=${encodeURIComponent(name)}`,
  ADD_TO_CART: '/addtocart',
  CLEAR_CART: '/cart/all',

  // Orders
  ORDERS: '/orders',
  ORDER_DETAILS: (id) => `/orders/${id}`,

  // Ratings
  RATE_BOOK: (id) => `/books/${id}/rate`,
  USER_RATINGS: '/user/ratings',

  // Wishlist
  WISHLIST: '/wishlist',
  WISHLIST_ADD: '/wishlist/add',
  WISHLIST_REMOVE: (id) => `/wishlist/remove/${id}`,
};
