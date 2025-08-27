import React from "react";
import { List } from "@mui/material";
import TrackItem from "./TrackItem";

export default function TrackList({ tracks = [], onDownload }) {
  // tracks = [] garantit que c'est toujours un tableau, même si undefined
  if (!tracks.length) return <p></p>;

  return (
    <List>
      {tracks.map((track) => (
        <TrackItem key={track.id} track={track} onDownload={onDownload} />
      ))}
    </List>
  );
}
