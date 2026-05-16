import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",

  user: null,

  token: null,

  posts: [],

  // CHAT
  socketUsers: [],
  conversations: [],
  messages: [],
  currentChat: null,

  loading: false,
  error: null,
  message: null,
};

export const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {

    /* =========================
       THEME
    ========================= */

    setMode: (state) => {

      state.mode =
        state.mode === "light"
          ? "dark"
          : "light";
    },



    /* =========================
       LOGIN
    ========================= */

    setLogin: (state, action) => {

      state.user = {
        ...action.payload.user,

        // REMOVE DUPLICATE FRIENDS
        friends: (
          action.payload.user?.friends || []
        ).filter(
          (friend, index, self) =>
            index ===
            self.findIndex(
              (f) => f._id === friend._id
            )
        ),
      };

      state.token =
        action.payload.token;
    },



    /* =========================
       LOGOUT
    ========================= */

    setLogout: (state) => {

      state.user = null;

      state.token = null;

      state.posts = [];

      state.messages = [];

      state.socketUsers = [];

      state.currentChat = null;

      state.conversations = [];

      state.loading = false;

      state.error = null;

      state.message = null;
    },



    /* =========================
       FRIENDS
    ========================= */

    setFriends: (state, action) => {

      if (state.user) {

        const uniqueFriends =
          (action.payload.friends || []).filter(
            (friend, index, self) =>
              index ===
              self.findIndex(
                (f) => f._id === friend._id
              )
          );

        state.user.friends =
          uniqueFriends;
      }
    },



    /* =========================
       POSTS
    ========================= */

    setPosts: (state, action) => {

      state.posts =
        action.payload.posts || [];
    },



    setPost: (state, action) => {

      state.posts = state.posts.map(
        (post) =>
          post._id ===
          action.payload.post._id
            ? action.payload.post
            : post
      );
    },



    deletePost: (state, action) => {

      state.posts =
        state.posts.filter(
          (post) =>
            post._id !==
            action.payload
        );
    },



    /* =========================
       CHAT
    ========================= */

    setCurrentChat: (
      state,
      action
    ) => {

      state.currentChat =
        action.payload;
    },



    /* =========================
       SET ALL MESSAGES
    ========================= */

    setMessages: (
      state,
      action
    ) => {

      const uniqueMessages =
        (action.payload || []).filter(
          (msg, index, self) =>
            index ===
            self.findIndex(
              (m) => m._id === msg._id
            )
        );

      state.messages =
        uniqueMessages;
    },



    /* =========================
       ADD SINGLE MESSAGE
    ========================= */

    addMessage: (
      state,
      action
    ) => {

      const newMsg =
        action.payload;

      const exists =
        state.messages.some(
          (msg) =>
            msg._id === newMsg._id
        );

      if (!exists) {

        state.messages.push(
          newMsg
        );
      }
    },



    /* =========================
       DELETE MESSAGE
    ========================= */

    deleteMessage: (
      state,
      action
    ) => {

      state.messages =
        state.messages.filter(
          (msg) =>
            msg._id !==
            action.payload
        );
    },



    /* =========================
       SOCKET USERS
    ========================= */

    setSocketUsers: (
      state,
      action
    ) => {

      const uniqueUsers =
        (action.payload || []).filter(
          (user, index, self) =>
            index ===
            self.findIndex(
              (u) =>
                u.userId ===
                user.userId
            )
        );

      state.socketUsers =
        uniqueUsers;
    },



    /* =========================
       LOADING
    ========================= */

    setLoading: (
      state,
      action
    ) => {

      state.loading =
        action.payload;
    },



    /* =========================
       ERROR
    ========================= */

    setError: (
      state,
      action
    ) => {

      state.error =
        action.payload;
    },



    /* =========================
       SUCCESS MESSAGE
    ========================= */

    setSuccessMessage: (
      state,
      action
    ) => {

      state.message =
        action.payload;
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

  // CHAT
  setCurrentChat,

  setMessages,

  addMessage,

  deleteMessage,

  setSocketUsers,
  setLoading,
  setError,
  setSuccessMessage,

} = authSlice.actions;



export default authSlice.reducer;