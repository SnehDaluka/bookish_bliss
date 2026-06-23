import { createSlice } from "@reduxjs/toolkit";

const loggingSlice = createSlice({
  name: "load",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    login(state) {
      state.isLoggedIn = true;
    },
    logout(state) {
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = loggingSlice.actions;
export default loggingSlice.reducer;
