import React from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { apiAddRecentlyPlayed } from "../api";
import { getFileUrl } from "../utils";
import TrackMenu from "./TrackMenu";
import PlaylistMenu from "./PlaylistMenu";

// Function to add to queue
function addToQueue(track, setToast) {
  if (window.addToQueue) {
    window.addToQueue(track);
    if (setToast) {
      setToast({ message: `"${track.title}" added to queue`, severity: "success" });
    }
    console.log(`Track added to queue: ${track.title}`);
  } else {
    console.warn("Player queue system not available");
    if (setToast) {
      setToast({ message: "Queue system not available", severity: "error" });
    }
  }
}

// Fonction pour jouer une track (même logique que Home/Library)
async function playTrack(track) {
  sessionStorage.setItem("currentTrack", JSON.stringify(track));
  sessionStorage.setItem("isPlaying", JSON.stringify(true));
  window.dispatchEvent(new Event("storage"));

  try {
    await apiAddRecentlyPlayed(track.id);
  } catch (err) {
    console.error("Error adding to recently played:", err);
  }
}

export default function TrackItem({ 
  track, 
  onDownload, 
  displayAlbum, 
  setToast,
  playlists = [],
  likedTracks = [],
  onAddToPlaylist,
  onToggleLike,
  onCreatePlaylist
}) {
  const isLocal = track.local;
  
  const handlePlayLocal = () => {
    if (isLocal && track.localTrack) {
      // Utiliser les données de la track locale
      const localTrackData = {
        ...track.localTrack,
        url: getFileUrl(track.localTrack.file_path)
      };
      playTrack(localTrackData);
    } else if (displayAlbum && track) {
      // Si on est dans un album, utiliser directement les données de la track
      const trackData = {
        ...track,
        url: getFileUrl(track.file_path)
      };
      playTrack(trackData);
    }
  };

  const handlePlay = () => {
    handlePlayLocal();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: isLocal && !displayAlbum ? "rgba(29,185,84,0.1)" : "rgba(255,255,255,0.05)",
        borderRadius: 2,
        p: 1,
        mb: 1,
        gap: 2,
        cursor: (isLocal && !displayAlbum) || displayAlbum ? "pointer" : "default",
        border: isLocal && !displayAlbum ? "1px solid rgba(29,185,84,0.3)" : "none",
        "&:hover": { 
          border: isLocal && !displayAlbum ? "1px solid rgba(29,185,84,0.3)" : "none",
          bgcolor: isLocal && !displayAlbum ? "rgba(29,185,84,0.15)" : "rgba(255,255,255,0.08)" 
        },
      }}
      onClick={(isLocal && !displayAlbum) || displayAlbum ? handlePlayLocal : undefined}
    >
      <Avatar
        src={displayAlbum ?  track.image : track.album?.images?.[0]?.url || ""}
        alt={displayAlbum ?  track.title : track.name}
        variant="rounded"
        sx={{ width: 48, height: 48 }}
      />

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Typography noWrap sx={{ fontSize: "0.95rem", color: "#fff" }}>
          {displayAlbum ? track.title : track.name}
        </Typography>
        <Typography noWrap sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
          {displayAlbum ? track.artist : track.artists?.map((a) => a.name).join(", ")}
        </Typography>
      </Box>

      {track.local && !displayAlbum && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon sx={{ color: "#1db954", fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: "#1db954", fontWeight: 500 }}>
            Available
          </Typography>
        </Box>
      )}

      {!track.local && !displayAlbum && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDownload(track.name, track.album?.name, track.artists?.map((a) => a.name).join(", "));
          }}
          sx={{ 
            color: "#1db954",
            padding: "4px",
            minWidth: "28px",
            minHeight: "28px",
            "& .MuiSvgIcon-root": {
              fontSize: "1rem"
            }
          }}
          size="small"
        >
          <DownloadIcon />
        </IconButton>
      )}

      {/* Boutons classiques pour les albums */}
      {displayAlbum && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* Bouton Like */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(track);
            }}
            sx={{ 
              color: likedTracks.includes(track.id) ? "#1db954" : "rgba(255,255,255,0.6)",
              "&:hover": { 
                color: likedTracks.includes(track.id) ? "#ff6b6b" : "#1db954",
                bgcolor: likedTracks.includes(track.id) ? "rgba(255,107,107,0.1)" : "rgba(29,185,84,0.1)"
              },
              padding: "4px",
              minWidth: "28px",
              minHeight: "28px"
            }}
            size="small"
          >
            {likedTracks.includes(track.id) ? <FavoriteIcon sx={{ fontSize: "1rem" }} /> : <FavoriteBorderIcon sx={{ fontSize: "1rem" }} />}
          </IconButton>
          
          <PlaylistMenu
            track={track}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
            onToggleLike={onToggleLike}
            isLiked={likedTracks.includes(track.id)}
            onCreatePlaylist={onCreatePlaylist}
            compact={true}
          />
          <TrackMenu
            track={track}
            onPlay={handlePlay}
            onAddToQueue={(track) => addToQueue(track, setToast)}
            showPlayOption={false} // Can already click on track
            setToast={setToast}
            compact={true}
          />
        </Box>
      )}
    </Box>
  );
}
