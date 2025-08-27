import React from "react";
import { ListItem, ListItemText, IconButton, ListItemAvatar, Avatar } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

export default function TrackItem({ track, onPlay, onLike, onAddPlaylist }) {
  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton onClick={() => onAddPlaylist(track)} sx={{ color: "#fff" }}>
            <PlaylistAddIcon />
          </IconButton>
          <IconButton onClick={() => onLike(track)} sx={{ color: track.liked ? "#1db954" : "#fff" }}>
            <FavoriteIcon />
          </IconButton>
          <IconButton onClick={() => onPlay(track)} sx={{ color: "#1db954" }}>
            <PlayArrowIcon />
          </IconButton>
        </>
      }
    >
      <ListItemAvatar>
        <Avatar variant="rounded" src={track.image || ""} />
      </ListItemAvatar>
      <ListItemText
        primary={`${track.artist} - ${track.title}`}
        secondary={track.album}
      />
    </ListItem>
  );
}
