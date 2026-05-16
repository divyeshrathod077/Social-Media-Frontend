import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";

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

  const socketUsers = useSelector(
    (state) => state.socketUsers
  );

  const [conversationId, setConversationId] =
    useState("");

  const [receiverUser, setReceiverUser] =
    useState(null);

  const [text, setText] = useState("");

  const [file, setFile] = useState(null);

  const [preview, setPreview] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const scrollRef = useRef();



  /* =========================
      ONLINE STATUS
  ========================= */

  const isOnline = socketUsers.some(
    (u) => u.userId === userId
  );



  /* =========================
      SOCKET
  ========================= */

  useEffect(() => {

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      "addUser",
      currentUser?._id
    );

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
      GET RECEIVER
  ========================= */

  useEffect(() => {

    const getReceiver = async () => {

      try {

        const response = await fetch(
          `http://localhost:3001/users/${userId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        setReceiverUser(data);

      } catch (err) {

        console.log(err);

      }
    };

    getReceiver();

  }, [userId, token]);




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

  }, [userId, currentUser?._id, token]);




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

  }, [conversationId, dispatch, token]);




  /* =========================
      SEND MESSAGE
  ========================= */

  const sendMessage = async () => {

    if (!text && !file) return;

    try {

      setUploading(true);

      setUploadProgress(0);

      const formData =
        new FormData();

      formData.append(
        "conversationId",
        conversationId
      );

      formData.append(
        "sender",
        currentUser._id
      );

      formData.append(
        "text",
        text
      );

      if (file) {

        formData.append(
          "media",
          file
        );
      }

      const response =
        await axios.post(
          "http://localhost:3001/messages/send",
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            onUploadProgress:
              (
                progressEvent
              ) => {

                const percent =
                  Math.round(
                    (
                      progressEvent.loaded *
                      100
                    ) /
                    progressEvent.total
                  );

                setUploadProgress(
                  percent
                );
              },
          }
        );

      const savedMessage =
        response.data;

      dispatch(
        addMessage(savedMessage)
      );

      socket.emit(
        "sendMessage",
        savedMessage
      );

      setText("");

      setFile(null);

      setPreview("");

      setUploading(false);

      setUploadProgress(0);

    } catch (err) {

      console.log(err);

      setUploading(false);

    }
  };




  /* =========================
      DELETE MESSAGE
  ========================= */

  const deleteMessage = async (
    messageId
  ) => {

    try {

      await axios.delete(
        `http://localhost:3001/messages/${messageId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updatedMessages =
        messages.filter(
          (msg) =>
            msg._id !== messageId
        );

      dispatch(
        setMessages(updatedMessages)
      );

    } catch (err) {

      console.log(err);

    }
  };




  /* =========================
      AUTO SCROLL
  ========================= */

  useEffect(() => {

    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);




  /* =========================
      FILE SELECT
  ========================= */

  const handleFileChange = (e) => {

    const selected =
      e.target.files[0];

    if (!selected) return;

    setFile(selected);

    setPreview(
      URL.createObjectURL(selected)
    );
  };




  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      bgcolor={
        palette.background.default
      }
    >
      <Typography
        p="2rem"
        textAlign="center"
      >
        Chat Page Working
      </Typography>
    </Box>
  );
};

export default ChatPage;