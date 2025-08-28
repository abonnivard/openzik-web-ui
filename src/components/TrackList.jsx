import React from "react";
import { List } from "@mui/material";
import TrackItem from "./TrackItem";

export default function TrackList({ tracks = [], onDownload, onPlayTrack, setToast }) {
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
        />
      ))}
    </List>
  );
}
