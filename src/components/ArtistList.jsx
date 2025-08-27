// ArtistList.jsx
import React from "react";
import { List } from "@mui/material";
import ArtistItem from "./ArtistItem";

export default function ArtistList({ artists = [] }) {
  if (!artists.length) return <p></p>;

  return (
    <List>
      {artists.slice(0, 5).map((artist) => (
        <ArtistItem key={artist.id} artist={artist} />
      ))}
    </List>
  );
}
