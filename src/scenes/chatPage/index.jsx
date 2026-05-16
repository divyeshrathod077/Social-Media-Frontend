import {
  Box,
  Typography,
  useTheme,
} from "@mui/material";

import { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";

import {
  addMessage,
  setMessages,
  setSocketUsers,
} from "state";

import { socket } from "../../socket";

const ChatPage = () => {

  const { palette } = useTheme();

  const dispatch = useDispatch();

  const { userId } = useParams();

  const token = useSelector(
    (state) => state.token
  );

  const currentUser = useSelector(
    (state) => state.user
  );

  const messages = useSelector(
    (state) => state.messages
  );

  const [conversationId, setConversationId] =
    useState("");

  const scrollRef = useRef(null);



  /* =========================
      SOCKET
  ========================= */

  useEffect(() => {

    if (!socket.connected) {
      socket.connect();
    }

    if (currentUser?._id) {

      socket.emit(
        "addUser",
        currentUser._id
      );
    }

    socket.off("getMessage");

    socket.on(
      "getMessage",
      (data) => {

        dispatch(addMessage(data));
      }
    );

    socket.off("getUsers");

    socket.on(
      "getUsers",
      (users) => {

        dispatch(
          setSocketUsers(users)
        );
      }
    );

    return () => {

      socket.off("getMessage");

      socket.off("getUsers");
    };

  }, [currentUser?._id, dispatch]);



  /* =========================
      CREATE CONVERSATION
  ========================= */

  useEffect(() => {

    const createConversation = async () => {

      try {

        const response = await fetch(
          "http://localhost:3001/messages/conversation",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              senderId:
                currentUser?._id,

              receiverId:
                userId,
            }),
          }
        );

        const data =
          await response.json();

        setConversationId(data._id);

      } catch (err) {

        console.log(err);
      }
    };

    if (
      currentUser?._id &&
      userId
    ) {

      createConversation();
    }

  }, [
    userId,
    currentUser?._id,
    token,
  ]);



  /* =========================
      GET MESSAGES
  ========================= */

  useEffect(() => {

    if (!conversationId) return;

    const getMessages = async () => {

      try {

        const response = await fetch(
          `http://localhost:3001/messages/${conversationId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        dispatch(
          setMessages(data)
        );

      } catch (err) {

        console.log(err);
      }
    };

    getMessages();

  }, [
    conversationId,
    dispatch,
    token,
  ]);



  /* =========================
      AUTO SCROLL
  ========================= */

  useEffect(() => {

    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);



  return (

    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      bgcolor={
        palette.background.default
      }
    >

      <Typography
        fontSize="2rem"
        fontWeight="bold"
      >
        Chat Page Working
      </Typography>

      <div ref={scrollRef}></div>

    </Box>
  );
};

export default ChatPage;