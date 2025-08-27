import React from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function ArtistItem({ artist }) {
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
        src={artist.images?.[0]?.url || ""}
        alt={artist.name}
        sx={{ width: 48, height: 48 }}
      />

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Typography noWrap sx={{ fontSize: "0.95rem", color: "#fff" }}>
          {artist.name}
        </Typography>
        <Typography noWrap sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
          Artist
        </Typography>
      </Box>

      <IconButton
        component="a"
        href={artist.external_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: "#1db954" }}
      >
        <OpenInNewIcon />
      </IconButton>
    </Box>
  );
}
