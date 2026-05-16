import {
  ManageAccountsOutlined,
  PersonAddOutlined,
  MessageOutlined,
} from "@mui/icons-material";

import {
  Box,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  setFriends,
} from "state";

import FlexBetween from "./FlexBetween";

import UserImage from "./UserImage";

const Friend = ({
  friendId,
  name,
  subtitle,
  userPicturePath,
}) => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { palette } = useTheme();

  const token = useSelector(
    (state) => state.token
  );

  const loggedInUser = useSelector(
    (state) => state.user
  );

  const {
    neutral,
    primary,
  } = palette;

  /* =========================
     CHECK FRIEND
  ========================= */

  const isFriend =
    loggedInUser?.friends?.some(
      (friend) => {

        // IF FRIEND OBJECT
        if (
          typeof friend === "object"
        ) {

          return (
            friend._id === friendId
          );
        }

        // IF FRIEND ID STRING
        return friend === friendId;
      }
    );

  /* =========================
     ADD / REMOVE FRIEND
  ========================= */

  const patchFriend =
    async () => {

      try {

        const response =
          await fetch(
            `http://localhost:3001/users/${loggedInUser._id}/friends/${friendId}`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        // ERROR CHECK
        if (!response.ok) {

          const errorText =
            await response.text();

          console.log(
            "Server Error:",
            errorText
          );

          return;
        }

        const data =
          await response.json();

        dispatch(
          setFriends({
            friends: data,
          })
        );

      } catch (err) {

        console.log(
          "Friend Error:",
          err
        );

      }
    };

  return (
    <FlexBetween>

      {/* LEFT SIDE */}
      <FlexBetween gap="1rem">

        <UserImage
          image={userPicturePath}
          size="55px"
        />

        <Box
          onClick={() =>
            navigate(
              `/profile/${friendId}`
            )
          }
        >

          <Typography
            color={neutral.dark}
            variant="h5"
            fontWeight="500"
            sx={{
              "&:hover": {
                color:
                  primary.light,
                cursor:
                  "pointer",
              },
            }}
          >
            {name}
          </Typography>

          <Typography
            color={neutral.medium}
            fontSize="0.75rem"
          >
            {subtitle}
          </Typography>

        </Box>
      </FlexBetween>

      {/* RIGHT SIDE */}
      <FlexBetween gap="0.5rem">

        {/* MESSAGE ICON ONLY FRIEND */}
        {isFriend && (

          <IconButton
            onClick={() =>
              navigate(
                `/chat/${friendId}`
              )
            }
            sx={{
              backgroundColor:
                primary.light,

              p: "0.6rem",
            }}
          >

            <MessageOutlined
              sx={{
                color:
                  primary.dark,
              }}
            />

          </IconButton>

        )}

        {/* ADD REMOVE FRIEND */}
        <IconButton
          onClick={patchFriend}
          sx={{
            backgroundColor:
              primary.light,

            p: "0.6rem",
          }}
        >

          {isFriend ? (

            <ManageAccountsOutlined
              sx={{
                color:
                  primary.dark,
              }}
            />

          ) : (

            <PersonAddOutlined
              sx={{
                color:
                  primary.dark,
              }}
            />

          )}

        </IconButton>

      </FlexBetween>

    </FlexBetween>
  );
};

export default Friend;