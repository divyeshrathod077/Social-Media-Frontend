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
      currentUser._id
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

  }, []);




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

  }, [userId]);




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
                currentUser._id,

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

    createConversation();

  }, [userId]);




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

  }, [conversationId]);




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

      {/* =========================
          HEADER
      ========================= */}

      <Box
        p="1rem"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderBottom="1px solid #333"
        bgcolor={
          palette.background.alt
        }
      >

        <Box
          display="flex"
          alignItems="center"
          gap="1rem"
        >

          <Avatar
            src={
              receiverUser?.picturePath?.startsWith(
                "http"
              )
                ? receiverUser.picturePath
                : `http://localhost:3001/assets/${receiverUser?.picturePath}`
            }
          />

          <Box>

            <Typography
              fontWeight="bold"
            >
              {
                receiverUser?.firstName
              }
              {" "}
              {
                receiverUser?.lastName
              }
            </Typography>

            <Typography
              fontSize="14px"
              color={
                isOnline
                  ? "limegreen"
                  : "gray"
              }
            >
              {
                isOnline
                  ? "Online"
                  : "Offline"
              }
            </Typography>

          </Box>
        </Box>
      </Box>




      {/* =========================
          CHAT AREA
      ========================= */}

      <Box
        flex="1"
        overflow="auto"
        p="1rem"
      >

        {messages.map(
          (msg, index) => {

            const ownMessage =
              String(msg.sender) ===
              String(currentUser._id);

            return (

              <Box
                key={msg._id || index}
                ref={
                  index ===
                  messages.length - 1
                    ? scrollRef
                    : null
                }
                display="flex"
                justifyContent={
                  ownMessage
                    ? "flex-end"
                    : "flex-start"
                }
                mb="1rem"
              >

                <Box
                  sx={{
                    backgroundColor:
                      ownMessage
                        ? "#1976d2"
                        : "#2b2b2b",

                    color: "white",

                    padding: "0.8rem",

                    borderRadius:
                      "16px",

                    maxWidth:
                      "350px",

                    wordBreak:
                      "break-word",

                    position:
                      "relative",
                  }}
                >

                  {/* DELETE BUTTON */}

                  {ownMessage && (

                    <IconButton
                      onClick={() =>
                        deleteMessage(
                          msg._id
                        )
                      }
                      sx={{
                        position:
                          "absolute",

                        top: "-10px",

                        right: "-10px",

                        background:
                          "#ff4444",

                        color:
                          "white",

                        width: "28px",

                        height: "28px",

                        "&:hover": {
                          background:
                            "#cc0000",
                        },
                      }}
                    >

                      <DeleteIcon
                        sx={{
                          fontSize:
                            "18px",
                        }}
                      />
                    </IconButton>

                  )}



                  {/* TEXT */}

                  {msg.text && (

                    <Typography>
                      {msg.text}
                    </Typography>

                  )}



                  {/* IMAGE */}

                  {msg.image && (

                    <img
                      src={msg.image}
                      alt="chat"
                      style={{
                        width: "100%",
                        marginTop:
                          "10px",
                        borderRadius:
                          "10px",
                      }}
                    />

                  )}



                  {/* VIDEO */}

                  {msg.video && (

                    <video
                      controls
                      style={{
                        width: "100%",
                        marginTop:
                          "10px",
                        borderRadius:
                          "10px",
                      }}
                    >
                      <source
                        src={msg.video}
                      />
                    </video>

                  )}

                </Box>
              </Box>
            );
          }
        )}
      </Box>




      {/* =========================
          UPLOAD BAR
      ========================= */}

      {uploading && (

        <Box
          px="1rem"
          pb="0.5rem"
        >

          <Typography
            mb="0.5rem"
          >
            Uploading
            {" "}
            {uploadProgress}%
          </Typography>

          <LinearProgress
            variant="determinate"
            value={
              uploadProgress
            }
          />
        </Box>

      )}




      {/* =========================
          PREVIEW
      ========================= */}

      {preview && (

        <Box
          p="1rem"
          borderTop="1px solid #333"
        >

          {file?.type.startsWith(
            "image"
          ) ? (

            <img
              src={preview}
              alt="preview"
              width="120px"
              style={{
                borderRadius:
                  "10px",
              }}
            />

          ) : (

            <video
              src={preview}
              width="180px"
              controls
              style={{
                borderRadius:
                  "10px",
              }}
            />

          )}
        </Box>

      )}




      {/* =========================
          FOOTER
      ========================= */}

      <Box
        p="1rem"
        display="flex"
        alignItems="center"
        gap="1rem"
        borderTop="1px solid #333"
        bgcolor={
          palette.background.alt
        }
      >

        {/* IMAGE */}

        <IconButton
          component="label"
        >

          <ImageIcon />

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={
              handleFileChange
            }
          />
        </IconButton>



        {/* VIDEO */}

        <IconButton
          component="label"
        >

          <VideocamIcon />

          <input
            hidden
            type="file"
            accept="video/*"
            onChange={
              handleFileChange
            }
          />
        </IconButton>



        {/* INPUT */}

        <TextField
          fullWidth
          placeholder="Type message..."
          value={text}
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
          sx={{
            backgroundColor:
              palette.background.paper,
            borderRadius:
              "10px",
          }}
        />



        {/* SEND */}

        <Button
          variant="contained"
          disabled={uploading}
          onClick={sendMessage}
          endIcon={
            uploading
              ? (
                <CircularProgress
                  size={18}
                  sx={{
                    color:
                      "white",
                  }}
                />
              )
              : (
                <SendIcon />
              )
          }
        >
          {
            uploading
              ? "Uploading..."
              : "Send"
          }
        </Button>
      </Box>
    </Box>
  );
};

export default ChatPage;