import { configureStore } from "@reduxjs/toolkit";
import LoggingSlice from "./slice/index";
import { apiSlice } from "./apiSlice";

export const store = configureStore({
  reducer: {
    logging: LoggingSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
