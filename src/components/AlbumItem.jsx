import React from "react";
import { Box, Avatar, Typography, IconButton, Chip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export default function AlbumItem({ album, onDownload, onPlayAlbum, onAlbumClick, setToast }) {
  const isLocal = album.local;
  
  const handlePlay = () => {
    if (isLocal && onPlayAlbum) {
      // Play first track of the album
      const firstTrack = album.localTracks?.[0] || album.tracks?.[0];
      if (firstTrack) {
        onPlayAlbum(firstTrack);
        // Set the entire album as the current playlist
        sessionStorage.setItem("selectedPlaylist", JSON.stringify({
          name: album.name,
          tracks: album.localTracks || album.tracks
        }));
        setToast({ message: `Lecture de l'album ${album.name} ✅`, severity: "success" });
      }
    }
  };

  const handleDownload = () => {
    if (onDownload && !isLocal) {
      onDownload(album);
    }
  };

  const handleAlbumClick = () => {
    if (isLocal && onAlbumClick) {
      onAlbumClick(album);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: isLocal ? "rgba(29,185,84,0.1)" : "rgba(255,255,255,0.05)",
        borderRadius: 2,
        p: 1,
        mb: 1,
        gap: 2,
        cursor: isLocal ? "pointer" : "default",
        border: isLocal ? "1px solid rgba(29,185,84,0.3)" : "none",
        "&:hover": { 
          bgcolor: isLocal ? "rgba(29,185,84,0.15)" : "rgba(255,255,255,0.08)" 
        },
      }}
      onClick={isLocal ? handleAlbumClick : undefined}
    >
      <Avatar
        src={album.images?.[0]?.url || ""}
        alt={album.name}
        variant="rounded"
        sx={{ width: 48, height: 48 }}
      />

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography noWrap sx={{ fontSize: "0.95rem", color: "#fff" }}>
            {album.name}
          </Typography>
          {isLocal && (
            <Chip 
              label={`${album.localTracks?.length || album.tracks?.length || 0} pistes`} 
              size="small" 
              sx={{ 
                bgcolor: "#1db954", 
                color: "#000", 
                fontSize: "0.7rem",
                height: 20
              }} 
            />
          )}
        </Box>
        <Typography noWrap sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
          {album.artist || album.artists?.map((a) => a.name).join(", ")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        {isLocal && onPlayAlbum && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            sx={{ color: "#1db954" }}
          >
            <PlayArrowIcon />
          </IconButton>
        )}
        
        {!isLocal && onDownload && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            sx={{ color: "#1db954" }}
          >
            <DownloadIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
