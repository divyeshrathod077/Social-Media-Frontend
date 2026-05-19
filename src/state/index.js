import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "dark",
  user: null,
  token: null,
  posts: [],
 
};

export const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {

    setMode: (state) => {
      state.mode =
        state.mode === "light"
          ? "dark"
          : "light";
    },

    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },

    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends =
          action.payload.friends;
      }
    },

    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },

    setPost: (state, action) => {
      state.posts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) {
          return action.payload.post;
        }
        return post;
      });
    },

    deletePost: (state, action) => {
      state.posts = state.posts.filter(
        (post) =>
          post._id !== action.payload
      );
    },

   
  },
});

export const {
  setMode,
  setLogin,
  setLogout,
  setFriends,
  setPosts,
  setPost,
  deletePost,
 
} = authSlice.actions;

export default authSlice.reducer;