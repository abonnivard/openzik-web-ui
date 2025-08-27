import React from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

export default function TrackItem({ track, onDownload }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "rgba(255,255,255,0.05)",
        borderRadius: 2,
        p: 1,
        mb: 1,
        gap: 2,
        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
      }}
    >
      <Avatar
        src={track.album.images?.[0]?.url || ""}
        alt={track.name}
        variant="rounded"
        sx={{ width: 48, height: 48 }}
      />

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Typography noWrap sx={{ fontSize: "0.95rem", color: "#fff" }}>
          {track.name}
        </Typography>
        <Typography noWrap sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
          {track.artists.map((a) => a.name).join(", ")} — {track.album.name}
        </Typography>
      </Box>

      <IconButton
        onClick={() =>
          onDownload(track.name, track.album.name, track.artists.map((a) => a.name).join(", "))
        }
        sx={{ color: "#1db954" }}
      >
        <DownloadIcon />
      </IconButton>
    </Box>
  );
}
