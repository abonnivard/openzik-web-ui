import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export default function TrackMenu({ 
  track, 
  onPlay, 
  onAddToQueue, 
  showPlayOption = true,
  setToast,
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
        <MoreVertIcon />
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
        {showPlayOption && (
          <MenuItem onClick={() => handleMenuAction(() => onPlay(track))}>
            <ListItemIcon sx={{ color: "#1db954" }}>
              <PlayArrowIcon />
            </ListItemIcon>
            <ListItemText primary="Listen now" />
          </MenuItem>
        )}

        <MenuItem onClick={() => handleMenuAction(() => {
          onAddToQueue(track);
          if (setToast) {
            setToast({ message: `"${track.title}" added to queue`, severity: "success" });
          }
        })}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <QueueMusicIcon />
          </ListItemIcon>
          <ListItemText primary="Add to queue" />
        </MenuItem>
      </Menu>
    </>
  );
}
