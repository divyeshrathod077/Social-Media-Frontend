import { Box, Typography, useTheme } from "@mui/material";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";

const FriendListWidget = ({ userId }) => {

  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);

  const friends =
    useSelector((state) => state.user?.friends || []);

  const getFriends = async () => {

    try {

      const res = await fetch(
        `http://localhost:3001/users/${userId}/friends`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      dispatch(setFriends({ friends: data }));

    } catch (err) {
      console.log(err);
    }
  };



  useEffect(() => {
    getFriends();
  }, [userId]);



  return (
    <WidgetWrapper>

      <Typography
        variant="h5"
        mb="1rem"
        color={palette.neutral.dark}
      >
        Friend List
      </Typography>

      <Box display="flex" flexDirection="column" gap="1rem">

        {friends?.length > 0 ? (
          friends.map((friend) => (
            <Friend
              key={friend._id || friend.id}   
              friendId={friend._id}
              name={`${friend.firstName} ${friend.lastName}`}
              subtitle={friend.occupation}
              userPicturePath={friend.picturePath}
            />
          ))
        ) : (
          <Typography color="gray">
            No friends found
          </Typography>
        )}

      </Box>

    </WidgetWrapper>
  );
};

export default FriendListWidget;