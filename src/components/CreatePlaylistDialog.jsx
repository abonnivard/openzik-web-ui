import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from "@mui/material";

const CreatePlaylistDialog = ({ 
  open, 
  onClose, 
  onCreatePlaylist, 
  defaultName = "",
  title = "Create New Playlist"
}) => {
  const [playlistName, setPlaylistName] = useState(defaultName);

  const handleCreate = () => {
    if (playlistName.trim()) {
      onCreatePlaylist(playlistName.trim());
      setPlaylistName("");
      onClose();
    }
  };

  const handleClose = () => {
    setPlaylistName("");
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "rgba(18, 18, 18, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }
      }}
    >
      <DialogTitle sx={{ color: "#fff", fontWeight: 600 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#1db954" }
              },
              "& .MuiInputLabel-root": { 
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": { color: "#1db954" }
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: "rgba(255, 255, 255, 0.7)",
            "&:hover": { 
              bgcolor: "rgba(255, 255, 255, 0.1)" 
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCreate}
          disabled={!playlistName.trim()}
          sx={{ 
            bgcolor: "#1db954",
            color: "#fff",
            "&:hover": { bgcolor: "#1ed760" },
            "&:disabled": { 
              bgcolor: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.3)"
            }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePlaylistDialog;
