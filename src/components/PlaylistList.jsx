import React from "react";
import { List, Typography, Paper } from "@mui/material";
import PlaylistItem from "./PlayListItem";

export default function PlaylistList({ playlists = [] }) {
  if (!playlists.length) return null;

  return (
    <Paper sx={{ p: 1, bgcolor: "background.paper", mb: 2 }} elevation={0}>
      <Typography variant="h6" sx={{ mb: 1 }}>Playlists</Typography>
      <List>
        {playlists.slice(0, 10).map((pl) => (
          <PlaylistItem key={pl.id} playlist={pl} />
        ))}
      </List>
    </Paper>
  );
}
