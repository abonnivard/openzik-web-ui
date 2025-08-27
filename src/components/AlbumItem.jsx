import React from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

export default function AlbumItem({ album, onDownload }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: "rgba(255,255,255,0.05)",
        borderRadius: 2,
        p: 1,
        mb: 1, // espacement entre éléments
        gap: 2,
        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
      }}
    >
      <Avatar
        src={album.images?.[0]?.url || ""}
        alt={album.name}
        variant="rounded"
        sx={{ width: 48, height: 48 }}
      />

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Typography noWrap sx={{ fontSize: "0.95rem", color: "#fff" }}>
          {album.name}
        </Typography>
        <Typography noWrap sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
          {album.artists.map((a) => a.name).join(", ")}
        </Typography>
      </Box>

      <IconButton onClick={() => onDownload(album)} sx={{ color: "#1db954" }}>
        <DownloadIcon />
      </IconButton>
    </Box>
  );
}
