import React from "react";
import { List } from "@mui/material";
import TrackItem from "./TrackItem";

export default function TrackList({ 
  tracks = [], 
  onDownload, 
  onPlayTrack, 
  setToast, 
  displayAlbum,
  playlists = [],
  likedTracks = [],
  onAddToPlaylist,
  onToggleLike,
  onCreatePlaylist
}) {
  if (!tracks || !Array.isArray(tracks) || !tracks.length) return null;
  return (
    <List>
      {tracks.map((track, index) => (
        <TrackItem 
          key={track.id || `track-${index}`} 
          track={track} 
          onDownload={onDownload}
          onPlayTrack={onPlayTrack}
          setToast={setToast}
          displayAlbum={displayAlbum}
          playlists={playlists}
          likedTracks={likedTracks}
          onAddToPlaylist={onAddToPlaylist}
          onToggleLike={onToggleLike}
          onCreatePlaylist={onCreatePlaylist}
        />
      ))}
    </List>
  );
}
