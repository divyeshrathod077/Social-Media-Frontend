import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  DeleteOutline,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";

import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setPost,
  deletePost,
} from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  videoPath,
  userPicturePath,
  likes,
  comments,
}) => {

  const [isComments, setIsComments] =
    useState(false);

  const dispatch =
    useDispatch();

  const token =
    useSelector(
      (state) => state.token
    );

  const loggedInUserId =
    useSelector(
      (state) => state.user._id
    );

  const isLiked =
    Boolean(
      likes[loggedInUserId]
    );

  const likeCount =
    Object.keys(likes).length;

  const { palette } =
    useTheme();

  const main =
    palette.neutral.main;

  const primary =
    palette.primary.main;


  /* =========================
     LIKE POST
  ========================= */
  const patchLike = async () => {

    try {

      const response =
        await fetch(
          `http://localhost:3001/posts/${postId}/like`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              userId:
                loggedInUserId,
            }),
          }
        );

      const updatedPost =
        await response.json();

      dispatch(
        setPost({
          post:
            updatedPost,
        })
      );

    } catch (err) {

      console.error(
        "Like Error:",
        err
      );
    }
  };


  /* =========================
     DELETE POST
  ========================= */
  const handleDeletePost =
    async () => {

      try {

        const confirmDelete =
          window.confirm(
            "Delete this post?"
          );

        if (!confirmDelete)
          return;

        const response =
          await fetch(
            `http://localhost:3001/posts/${postId}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (response.ok) {

          dispatch(
            deletePost(postId)
          );

        } else {

          console.error(
            "Delete failed:",
            data.message
          );
        }

      } catch (err) {

        console.error(
          "Delete error:",
          err
        );
      }
    };


  /* =========================
     MEDIA URL
  ========================= */
  const getMediaUrl = (
    path
  ) => {

    if (!path)
      return null;

    if (
      path.startsWith(
        "http"
      )
    ) {
      return path;
    }

    return `http://localhost:3001/assets/${path}`;
  };

  const imageUrl =
    getMediaUrl(
      picturePath
    );

  const videoUrl =
    getMediaUrl(
      videoPath
    );


  return (

    <WidgetWrapper m="2rem 0">

      <Friend
        friendId={postUserId}

        name={name}

        subtitle={location}

        userPicturePath={
          userPicturePath
        }
      />


      <Typography
        color={main}
        sx={{
          mt: "1rem",
        }}
      >
        {description}
      </Typography>


      {/* IMAGE */}
      {imageUrl && (

        <img
          width="100%"

          alt="post"

          style={{
            borderRadius:
              "0.75rem",

            marginTop:
              "0.75rem",
          }}

          src={imageUrl}
        />
      )}


      {/* VIDEO */}
      {videoUrl && (

        <video
          width="100%"

          controls

          style={{
            borderRadius:
              "0.75rem",

            marginTop:
              "0.75rem",
          }}
        >

          <source
            src={videoUrl}
          />

        </video>
      )}


      <FlexBetween mt="0.25rem">

        {/* LEFT */}
        <FlexBetween gap="1rem">

          {/* LIKE */}
          <FlexBetween gap="0.3rem">

            <IconButton
              onClick={
                patchLike
              }
            >

              {isLiked ? (

                <FavoriteOutlined
                  sx={{
                    color:
                      primary,
                  }}
                />

              ) : (

                <FavoriteBorderOutlined />
              )}

            </IconButton>

            <Typography>
              {likeCount}
            </Typography>

          </FlexBetween>


          {/* COMMENTS */}
          <FlexBetween gap="0.3rem">

            <IconButton
              onClick={() =>
                setIsComments(
                  !isComments
                )
              }
            >

              <ChatBubbleOutlineOutlined />

            </IconButton>

            <Typography>
              {comments.length}
            </Typography>

          </FlexBetween>

        </FlexBetween>


        {/* RIGHT */}
        <FlexBetween gap="0.5rem">

          {/* SHARE */}
          <IconButton>
            <ShareOutlined />
          </IconButton>


          {/* DELETE */}
          {loggedInUserId ===
            postUserId && (

            <IconButton
              onClick={
                handleDeletePost
              }
            >

              <DeleteOutline
                sx={{
                  color:
                    "red",
                }}
              />

            </IconButton>
          )}

        </FlexBetween>

      </FlexBetween>


      {/* COMMENTS */}
      {isComments && (

        <Box mt="0.5rem">

          {comments.map(
            (
              comment,
              i
            ) => (

              <Box
                key={`${name}-${i}`}
              >

                <Divider />

                <Typography
                  sx={{
                    color:
                      main,

                    m:
                      "0.5rem 0",

                    pl:
                      "1rem",
                  }}
                >
                  {comment}
                </Typography>

              </Box>
            )
          )}

          <Divider />

        </Box>
      )}

    </WidgetWrapper>
  );
};

export default PostWidget;