import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URLS } from './apiUrls';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || '',
    credentials: 'include',
  }),
  tagTypes: ['User', 'Cart', 'Books', 'Orders', 'UserRatings', 'Wishlist'],
  endpoints: (builder) => ({
    // Auth & User Endpoints
    getProfile: builder.query({
      query: () => API_URLS.PROFILE,
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: API_URLS.UPDATE_PROFILE,
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: API_URLS.CHANGE_PASSWORD,
        method: 'PATCH',
        body: passwordData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: API_URLS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Cart'], // Invalidate to refetch profile and cart after login
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: API_URLS.REGISTER,
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation({
      query: (data) => ({
        url: API_URLS.LOGOUT,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Cart'], // Clear cache on logout
    }),
    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: API_URLS.MESSAGES,
        method: 'POST',
        body: messageData,
      }),
    }),

    // Books Endpoints
    getBooks: builder.query({
      query: (page = 1) => API_URLS.BOOKS(page),
      providesTags: ['Books'],
    }),
    getBooksByCategory: builder.query({
      query: ({ category, page = 1 }) => API_URLS.BOOKS_CATEGORY(category, page),
      providesTags: ['Books'],
    }),
    searchBooks: builder.query({
      query: ({ name, page = 1 }) => API_URLS.BOOKS_SEARCH(name, page),
      providesTags: ['Books'],
    }),
    getBookDetails: builder.query({
      query: (id) => API_URLS.BOOK_DETAILS(id),
      providesTags: (result, error, id) => [{ type: 'Books', id }],
    }),
    getBookByName: builder.query({
      query: (name) => API_URLS.BOOK_BY_NAME(name),
      providesTags: ['Books'],
    }),
    requestBook: builder.mutation({
      query: (bookDetails) => ({
        url: API_URLS.REQUEST_BOOK,
        method: 'POST',
        body: bookDetails,
      }),
    }),
    getRecommendations: builder.query({
      query: () => API_URLS.RECOMMENDATIONS,
      providesTags: ['Books'],
    }),

    // Cart Endpoints
    getCartItems: builder.query({
      query: () => API_URLS.CART_ITEMS,
      providesTags: ['Cart'],
    }),
    checkInCart: builder.query({
      query: (name) => API_URLS.CART(name),
      providesTags: (result, error, name) => [{ type: 'Cart', id: name }],
    }),
    addToCart: builder.mutation({
      query: (item) => ({
        url: API_URLS.ADD_TO_CART,
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Cart', 'Wishlist'],
    }),
    updateCartItem: builder.mutation({
      query: ({ name, quantity }) => ({
        url: API_URLS.CART(name),
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation({
      query: (name) => ({
        url: API_URLS.CART(name),
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: API_URLS.CLEAR_CART,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // Orders Endpoints
    getOrders: builder.query({
      query: () => API_URLS.ORDERS,
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query({
      query: (id) => API_URLS.ORDER_DETAILS(id),
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
    placeOrder: builder.mutation({
      query: () => ({
        url: API_URLS.ORDERS,
        method: 'POST',
      }),
      invalidatesTags: ['Cart', 'Orders'],
    }),
    rateBook: builder.mutation({
      query: ({ id, bookName, rating }) => ({
        url: API_URLS.RATE_BOOK(id),
        method: 'POST',
        body: { rating, bookName },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Books', id }, 'Orders', 'UserRatings'],
    }),
    getUserRatings: builder.query({
      query: () => API_URLS.USER_RATINGS,
      providesTags: ['UserRatings'],
    }),

    // Wishlist Endpoints
    getWishlist: builder.query({
      query: () => API_URLS.WISHLIST,
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation({
      query: (body) => ({
        url: API_URLS.WISHLIST_ADD,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation({
      query: (id) => ({
        url: API_URLS.WISHLIST_REMOVE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useSendMessageMutation,
  useGetBooksQuery,
  useGetBooksByCategoryQuery,
  useSearchBooksQuery,
  useGetBookDetailsQuery,
  useGetBookByNameQuery,
  useGetCartItemsQuery,
  useCheckInCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  usePlaceOrderMutation,
  useRateBookMutation,
  useGetUserRatingsQuery,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useRequestBookMutation,
  useGetRecommendationsQuery,
} = apiSlice;
