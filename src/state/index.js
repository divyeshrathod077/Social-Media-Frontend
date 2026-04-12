import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 🌙 Toggle Dark/Light Mode
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },

    // 🔐 Login
    setLogin: (state, action) => {
      state.user = {
        ...action.payload.user,
        friends: action.payload.user?.friends || [], // ✅ ensure array
      };
      state.token = action.payload.token;
    },

    // 🚪 Logout
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.posts = [];
    },

    // 👥 Set Friends (SAFE)
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = Array.isArray(action.payload.friends)
          ? action.payload.friends
          : [];
      } else {
        console.error("User not found while setting friends");
      }
    },

    // 📝 Set All Posts
    setPosts: (state, action) => {
      state.posts = Array.isArray(action.payload.posts)
        ? action.payload.posts
        : [];
    },

    // 🔄 Update Single Post
    setPost: (state, action) => {
      state.posts = state.posts.map((post) =>
        post._id === action.payload.post._id
          ? action.payload.post
          : post
      );
    },
  },
});

// ✅ Export Actions
export const {
  setMode,
  setLogin,
  setLogout,
  setFriends,
  setPosts,
  setPost,
} = authSlice.actions;

// ✅ Export Reducer
export default authSlice.reducer;