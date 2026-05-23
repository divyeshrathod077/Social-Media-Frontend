import {
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
  VideocamOutlined,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
  LinearProgress, // 🔥 added
} from "@mui/material";

import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import API_BASE from "../../api";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isMedia, setIsMedia] = useState(false);
  const [file, setFile] = useState(null);
  const [post, setPost] = useState("");

  // 🔥 NEW STATES
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  const handlePost = async () => {
    try {
      if (!file && !post) return;

      setLoading(true);
      setProgress(10);

      const isVideo = file?.type?.startsWith("video");

      const url = isVideo
        ? `${API_BASE}/posts/create/video`
        : `${API_BASE}/posts/create/image`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", post);

      // 🔥 fake progress animation
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!response.ok) {
        const text = await response.text();
        console.error("Upload Error:", text);
        setLoading(false);
        return;
      }

      const posts = await response.json();
      dispatch(setPosts({ posts }));

      setFile(null);
      setPost("");
      setLoading(false);
      setProgress(0);
    } catch (err) {
      console.error("Post Error:", err);
      setLoading(false);
    }
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => setPost(e.target.value)}
          value={post}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
      </FlexBetween>

      {isMedia && (
        <Box mt="1rem">
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png,.mp4,.mov"
            multiple={false}
            onDrop={(files) => setFile(files[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <Box
                {...getRootProps()}
                border={`2px dashed ${palette.primary.main}`}
                p="1rem"
                sx={{ cursor: "pointer" }}
              >
                <input {...getInputProps()} />

                {!file ? (
                  <p>Add Image or Video</p>
                ) : (
                  <FlexBetween>
                    <Typography>{file.name}</Typography>
                    <EditOutlined />
                  </FlexBetween>
                )}
              </Box>
            )}
          </Dropzone>

          {/* 🔥 PREVIEW */}
          {file && (
            <Box mt="1rem">
              {file.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  width="100%"
                  style={{ borderRadius: "10px" }}
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  width="100%"
                  controls
                  style={{ borderRadius: "10px" }}
                />
              )}
            </Box>
          )}

          {/* 🔥 PROGRESS BAR */}
          {loading && (
            <Box mt="1rem">
              <LinearProgress variant="determinate" value={progress} />
              <Typography align="center">{progress}%</Typography>
            </Box>
          )}

          {file && (
            <IconButton onClick={() => setFile(null)}>
              <DeleteOutlined />
            </IconButton>
          )}
        </Box>
      )}

      <Divider sx={{ margin: "1rem 0" }} />

      <FlexBetween>
        <FlexBetween onClick={() => setIsMedia(!isMedia)}>
          <ImageOutlined />
          <Typography>Media</Typography>
        </FlexBetween>

        {isNonMobileScreens && (
          <FlexBetween>
            <VideocamOutlined />
            <Typography>Video</Typography>
          </FlexBetween>
        )}

        <Button
          disabled={loading || (!post && !file)}
          onClick={handlePost}
          sx={{
            backgroundColor: palette.primary.main,
            color: "#fff",
            borderRadius: "2rem",
          }}
        >
          {loading ? "Uploading..." : "POST"}
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;