import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
} from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

export default function PlaylistMenu({ 
  track, 
  playlists = [], 
  onAddToPlaylist, 
  onToggleLike, 
  isLiked = false,
  onCreatePlaylist,
  compact = false
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action) => {
    handleClose();
    action();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ 
          color: "rgba(255,255,255,0.7)",
          "&:hover": { color: "#fff" },
          padding: compact ? "2px" : "6px",
          minWidth: compact ? "28px" : "36px",
          minHeight: compact ? "28px" : "36px",
          "& .MuiSvgIcon-root": {
            fontSize: compact ? "0.9rem" : "1.1rem"
          }
        }}
        size={compact ? "small" : "medium"}
      >
        <PlaylistAddIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            bgcolor: "#282828",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            "& .MuiMenuItem-root": {
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            },
          },
        }}
      >


        {playlists.map((playlist) => (
          <MenuItem
            key={playlist.id}
            onClick={() => handleMenuAction(() => onAddToPlaylist(playlist.id, track))}
          >
            <ListItemText primary={`Add to "${playlist.name}"`} />
          </MenuItem>
        ))}

        {onCreatePlaylist && (
          <MenuItem onClick={() => handleMenuAction(() => onCreatePlaylist(track))}>
            <ListItemText primary="Create new playlist" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
