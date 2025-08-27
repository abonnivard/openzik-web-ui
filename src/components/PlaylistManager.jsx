import React, { useState, useEffect } from "react";
import { List, ListItem, ListItemText, Button, TextField } from "@mui/material";

export default function PlaylistManager({ playlists, setPlaylists, tracks }) {
  const [newName, setNewName] = useState("");

  const createPlaylist = () => {
    if (!newName) return;
    setPlaylists({ ...playlists, [newName]: [] });
    setNewName("");
  };

  const addTrackToPlaylist = (playlistName, track) => {
    const updated = { ...playlists };
    if (!updated[playlistName].includes(track.file_path)) {
      updated[playlistName].push(track.file_path);
      setPlaylists(updated);
    }
  };

  return (
    <div>
      <TextField
        label="New Playlist"
        size="small"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        sx={{ mr: 1 }}
      />
      <Button variant="contained" onClick={createPlaylist}>Create</Button>

      {Object.keys(playlists).map((name) => (
        <List key={name}>
          <ListItem>
            <ListItemText primary={name} />
          </ListItem>
          {playlists[name].map((filePath) => {
            const track = tracks.find((t) => t.file_path === filePath);
            return track ? (
              <ListItem key={filePath} sx={{ pl: 4 }}>
                <ListItemText primary={track.title} secondary={track.artist} />
              </ListItem>
            ) : null;
          })}
        </List>
      ))}
    </div>
  );
}
