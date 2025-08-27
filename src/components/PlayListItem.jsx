import React from "react";
import { ListItem, ListItemAvatar, Avatar, ListItemText, Button, Box } from "@mui/material";

export default function PlaylistItem({ playlist }) {
  const image = playlist.images?.[0]?.url;
  const owner = playlist.owner?.display_name || playlist.owner?.id || "—";
  return (
    <ListItem
      sx={{
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 1,
        px: 1,
      }}
    >
      <ListItemAvatar>
        <Avatar
          src={image}
          sx={{ width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={playlist.name}
        secondary={`par ${owner} • ${playlist.tracks?.total ?? 0} titres`}
        sx={{ width: "100%", mt: { xs: 0.5, sm: 0 } }}
      />
      <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
        <Button
          variant="contained"
          color="primary"
          href={playlist.external_urls?.spotify}
          target="_blank"
          fullWidth
        >
          Spotify
        </Button>
      </Box>
    </ListItem>
  );
}
