// ArtistList.jsx
import React from "react";
import { List } from "@mui/material";
import ArtistItem from "./ArtistItem";

export default function ArtistList({ artists = [] }) {
  if (!artists || !Array.isArray(artists) || !artists.length) return null;

  return (
    <List>
      {artists.slice(0, 5).map((artist, index) => (
        <ArtistItem key={artist.id || `artist-${index}`} artist={artist} />
      ))}
    </List>
  );
}
